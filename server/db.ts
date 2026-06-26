import { eq, and, desc, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, concursos, inscricoes, dadosPessoais, Concurso, Inscricao, DadosPessoais, InsertConcurso, InsertInscricao, InsertDadosPessoais } from "../drizzle/schema";
import { ENV } from './_core/env';
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

const CONCURSOS_MOCK: Concurso[] = [
  {
    id: 1,
    nome: "Concurso Público - Ministério da Educação",
    cargo: "Analista de Sistemas",
    vagas: 50,
    banca: "CESPE",
    dataInscricaoInicio: "2026-06-15",
    dataInscricaoFim: "2026-07-15",
    dataProva: "2026-08-20",
    valorInscricao: "150.00",
    descricao: "Concurso para preenchimento de vagas de Analista de Sistemas",
    edital: "https://exemplo.com/edital1",
    urlBanca: null,
    status: "ativo",
    criadoEm: new Date("2026-06-01"),
    atualizadoEm: new Date("2026-06-01"),
  },
  {
    id: 2,
    nome: "Concurso Público - Receita Federal",
    cargo: "Auditor-Fiscal",
    vagas: 100,
    banca: "ESAF",
    dataInscricaoInicio: "2026-06-01",
    dataInscricaoFim: "2026-06-30",
    dataProva: "2026-08-10",
    valorInscricao: "200.00",
    descricao: "Concurso para Auditor-Fiscal da Receita Federal",
    edital: "https://exemplo.com/edital2",
    urlBanca: null,
    status: "ativo",
    criadoEm: new Date("2026-06-01"),
    atualizadoEm: new Date("2026-06-01"),
  },
  {
    id: 3,
    nome: "Concurso Público - Polícia Federal",
    cargo: "Agente de Polícia Federal",
    vagas: 200,
    banca: "CESPE",
    dataInscricaoInicio: "2026-07-01",
    dataInscricaoFim: "2026-07-31",
    dataProva: "2026-09-15",
    valorInscricao: "180.00",
    descricao: "Concurso para Agente de Polícia Federal",
    edital: "https://exemplo.com/edital3",
    urlBanca: null,
    status: "ativo",
    criadoEm: new Date("2026-06-01"),
    atualizadoEm: new Date("2026-06-01"),
  },
  {
    id: 4,
    nome: "Concurso Público - Banco do Brasil",
    cargo: "Escriturário",
    vagas: 150,
    banca: "CESGRANRIO",
    dataInscricaoInicio: "2026-05-15",
    dataInscricaoFim: "2026-06-15",
    dataProva: "2026-07-20",
    valorInscricao: "120.00",
    descricao: "Concurso para Escriturário do Banco do Brasil",
    edital: "https://exemplo.com/edital4",
    urlBanca: null,
    status: "ativo",
    criadoEm: new Date("2026-06-01"),
    atualizadoEm: new Date("2026-06-01"),
  },
  {
    id: 5,
    nome: "Concurso Público - TCU",
    cargo: "Auditor Federal de Controle Externo",
    vagas: 80,
    banca: "CESPE",
    dataInscricaoInicio: "2026-08-01",
    dataInscricaoFim: "2026-08-31",
    dataProva: "2026-10-10",
    valorInscricao: "250.00",
    descricao: "Concurso para Auditor Federal de Controle Externo",
    edital: "https://exemplo.com/edital5",
    urlBanca: null,
    status: "ativo",
    criadoEm: new Date("2026-06-01"),
    atualizadoEm: new Date("2026-06-01"),
  },
];

// Concursos queries
export async function getConcursos() {
  const db = await getDb();
  if (db) {
    return db.select().from(concursos).where(eq(concursos.status, 'ativo')).orderBy(desc(concursos.criadoEm));
  }

  // Camada 2: JSON gerado pelo scraper Python
  const jsonPath = resolve(process.cwd(), "scraper", "concursos_scraped.json");
  if (existsSync(jsonPath)) {
    try {
      const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
      return (raw.concursos as Omit<Concurso, "id" | "criadoEm" | "atualizadoEm">[]).map(
        (c, i) => ({ ...c, id: i + 1, criadoEm: new Date(), atualizadoEm: new Date() } as Concurso)
      );
    } catch {
      console.warn("[db] concursos_scraped.json inválido, usando mock");
    }
  }

  // Camada 3: mock hardcoded
  return CONCURSOS_MOCK;
}

export async function getConcursoById(id: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(concursos).where(eq(concursos.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  const lista = await getConcursos();
  return lista.find(c => c.id === id);
}

export async function createConcurso(data: InsertConcurso) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(concursos).values(data);
  return result;
}

export async function updateConcurso(id: number, data: Partial<InsertConcurso>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(concursos).set(data).where(eq(concursos.id, id));
}

export async function deleteConcurso(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(concursos).where(eq(concursos.id, id));
}

// Inscrições queries
export async function createInscricao(data: InsertInscricao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(inscricoes).values(data);
}

export async function getInscricoesByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoes)
    .where(and(eq(inscricoes.usuarioId, usuarioId), eq(inscricoes.status, 'confirmada')))
    .orderBy(desc(inscricoes.dataInscricao));
}

export async function getInscricaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(inscricoes).where(eq(inscricoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInscricao(id: number, data: Partial<InsertInscricao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(inscricoes).set(data).where(eq(inscricoes.id, id));
}

export async function cancelarInscricao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(inscricoes).set({ status: 'cancelada', dataCancelamento: new Date() }).where(eq(inscricoes.id, id));
}

export async function getAllInscricoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoes).orderBy(desc(inscricoes.dataInscricao));
}

// Dados Pessoais queries
export async function getDadosPessoaisByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dadosPessoais).where(eq(dadosPessoais.usuarioId, usuarioId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDadosPessoais(data: InsertDadosPessoais) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dadosPessoais).values(data);
}

export async function updateDadosPessoais(usuarioId: number, data: Partial<InsertDadosPessoais>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(dadosPessoais).set(data).where(eq(dadosPessoais.usuarioId, usuarioId));
}

// TODO: add feature queries here as your schema grows.
