import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function runScraper(): Promise<{ total: number; ultimaAtualizacao: string }> {
  return new Promise((resolveFn, reject) => {
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const scriptPath = resolve(process.cwd(), "scraper", "scraper.py");

    function trySpawn(cmd: string) {
      const proc = spawn(cmd, [scriptPath], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
      });
      proc.stdout.on("data", (d: Buffer) => process.stdout.write(d));
      proc.stderr.on("data", (d: Buffer) => process.stderr.write(d));
      proc.on("error", (err) => {
        if (cmd === "python" && (err as NodeJS.ErrnoException).code === "ENOENT") {
          trySpawn("py");
        } else {
          reject(err);
        }
      });
      proc.on("close", (code) => {
        if (code !== 0) return reject(new Error(`Scraper encerrou com código ${code}`));
        resolveFn(lerResultado());
      });
    }

    trySpawn(pythonCmd);
  });
}

function lerResultado(): { total: number; ultimaAtualizacao: string } {
  const jsonPath = resolve(process.cwd(), "scraper", "concursos_scraped.json");
  if (!existsSync(jsonPath)) return { total: 0, ultimaAtualizacao: new Date().toISOString() };
  const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
  return { total: data.total ?? 0, ultimaAtualizacao: data.ultimaAtualizacao ?? new Date().toISOString() };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    devLogin: publicProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })).mutation(async ({ ctx, input }) => {
      const openId = `local_${Buffer.from(input.email).toString("base64url")}`;
      await db.upsertUser({
        openId,
        name: input.name,
        email: input.email,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true } as const;
    }),
  }),

  concursos: router({
    list: publicProcedure.query(() => db.getConcursos()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getConcursoById(input.id)),
    create: protectedProcedure.input(z.object({
      nome: z.string().min(1),
      cargo: z.string().min(1),
      vagas: z.number().int().positive(),
      banca: z.string().min(1),
      dataInscricaoInicio: z.date(),
      dataInscricaoFim: z.date(),
      dataProva: z.date().optional(),
      valorInscricao: z.string(),
      descricao: z.string().optional(),
      edital: z.string().optional(),
    })).mutation(({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Apenas administradores podem criar concursos');
      }
      return db.createConcurso({
        ...input,
        status: 'ativo',
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      cargo: z.string().optional(),
      vagas: z.number().optional(),
      banca: z.string().optional(),
      dataInscricaoInicio: z.date().optional(),
      dataInscricaoFim: z.date().optional(),
      dataProva: z.date().optional().nullable(),
      valorInscricao: z.string().optional(),
      descricao: z.string().optional().nullable(),
      edital: z.string().optional().nullable(),
    })).mutation(({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Apenas administradores podem editar concursos');
      }
      const { id, ...data } = input;
      return db.updateConcurso(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Apenas administradores podem deletar concursos');
      }
      return db.deleteConcurso(input.id);
    }),
    atualizar: publicProcedure.mutation(async () => {
      try {
        return await runScraper();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Falha no scraper: ${msg}`);
      }
    }),
  }),

  inscricoes: router({
    create: protectedProcedure.input(z.object({
      concursoId: z.number(),
      cpf: z.string(),
      telefone: z.string(),
      cep: z.string(),
      endereco: z.string(),
      numero: z.string(),
      complemento: z.string().optional(),
      bairro: z.string(),
      cidade: z.string(),
      estado: z.string(),
      taxaInscricao: z.string(),
      isencao: z.enum(['nao', 'doador_sangue', 'baixa_renda']),
    })).mutation(({ ctx, input }) => db.createInscricao({
      ...input,
      usuarioId: ctx.user!.id,
      status: 'confirmada',
    })),
    getByUsuario: protectedProcedure.query(({ ctx }) => db.getInscricoesByUsuario(ctx.user!.id)),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getInscricaoById(input.id)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      cpf: z.string().optional(),
      telefone: z.string().optional(),
      cep: z.string().optional(),
      endereco: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      taxaInscricao: z.string().optional(),
      isencao: z.enum(['nao', 'doador_sangue', 'baixa_renda']).optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateInscricao(id, data);
    }),
    cancelar: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.cancelarInscricao(input.id)),
    getAll: protectedProcedure.query(({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Apenas administradores podem acessar todas as inscrições');
      }
      return db.getAllInscricoes();
    }),
  }),

  dadosPessoais: router({
    getByUsuario: protectedProcedure.query(({ ctx }) => db.getDadosPessoaisByUsuario(ctx.user!.id)),
    create: protectedProcedure.input(z.object({
      cpf: z.string(),
      dataNascimento: z.date().optional(),
      genero: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_informar']).optional(),
      nacionalidade: z.string().optional(),
      naturalidade: z.string().optional(),
      mae: z.string().optional(),
      rg: z.string().optional(),
      orgaoExpedidor: z.string().optional(),
      dataExpedicao: z.date().optional(),
    })).mutation(({ ctx, input }) => db.createDadosPessoais({
      ...input,
      usuarioId: ctx.user!.id,
    })),
    update: protectedProcedure.input(z.object({
      cpf: z.string().optional(),
      dataNascimento: z.date().optional(),
      genero: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_informar']).optional(),
      nacionalidade: z.string().optional(),
      naturalidade: z.string().optional(),
      mae: z.string().optional(),
      rg: z.string().optional(),
      orgaoExpedidor: z.string().optional(),
      dataExpedicao: z.date().optional(),
    })).mutation(({ ctx, input }) => db.updateDadosPessoais(ctx.user!.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
