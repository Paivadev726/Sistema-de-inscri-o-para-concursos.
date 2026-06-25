import { eq, and, desc, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, concursos, inscricoes, dadosPessoais, Concurso, Inscricao, DadosPessoais, InsertConcurso, InsertInscricao, InsertDadosPessoais } from "../drizzle/schema";
import { ENV } from './_core/env';

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

// Concursos queries
export async function getConcursos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(concursos).where(eq(concursos.status, 'ativo')).orderBy(desc(concursos.criadoEm));
}

export async function getConcursoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(concursos).where(eq(concursos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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
