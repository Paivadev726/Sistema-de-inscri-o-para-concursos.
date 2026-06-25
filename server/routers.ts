import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
