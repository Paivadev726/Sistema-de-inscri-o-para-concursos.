import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de concursos públicos
 */
export const concursos = mysqlTable("concursos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 255 }).notNull(),
  vagas: int("vagas").notNull(),
  banca: varchar("banca", { length: 255 }).notNull(),
  dataInscricaoInicio: date("dataInscricaoInicio").notNull(),
  dataInscricaoFim: date("dataInscricaoFim").notNull(),
  dataProva: date("dataProva"),
  valorInscricao: decimal("valorInscricao", { precision: 10, scale: 2 }).notNull(),
  descricao: text("descricao"),
  edital: varchar("edital", { length: 500 }),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type Concurso = typeof concursos.$inferSelect;
export type InsertConcurso = typeof concursos.$inferInsert;

/**
 * Tabela de inscrições de candidatos em concursos
 */
export const inscricoes = mysqlTable("inscricoes", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  concursoId: int("concursoId").notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  telefone: varchar("telefone", { length: 15 }).notNull(),
  cep: varchar("cep", { length: 9 }).notNull(),
  endereco: varchar("endereco", { length: 500 }).notNull(),
  numero: varchar("numero", { length: 10 }).notNull(),
  complemento: varchar("complemento", { length: 255 }),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  taxaInscricao: decimal("taxaInscricao", { precision: 10, scale: 2 }).notNull(),
  isencao: mysqlEnum("isencao", ["nao", "doador_sangue", "baixa_renda"]).default("nao").notNull(),
  status: mysqlEnum("status", ["confirmada", "cancelada", "pendente"]).default("confirmada").notNull(),
  dataInscricao: timestamp("dataInscricao").defaultNow().notNull(),
  dataCancelamento: timestamp("dataCancelamento"),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type Inscricao = typeof inscricoes.$inferSelect;
export type InsertInscricao = typeof inscricoes.$inferInsert;

/**
 * Tabela de dados pessoais do candidato
 */
export const dadosPessoais = mysqlTable("dadosPessoais", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull().unique(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  dataNascimento: date("dataNascimento"),
  genero: mysqlEnum("genero", ["masculino", "feminino", "outro", "prefiro_nao_informar"]),
  nacionalidade: varchar("nacionalidade", { length: 100 }).default("Brasileira"),
  naturalidade: varchar("naturalidade", { length: 100 }),
  mae: varchar("mae", { length: 255 }),
  rg: varchar("rg", { length: 20 }),
  orgaoExpedidor: varchar("orgaoExpedidor", { length: 10 }),
  dataExpedicao: date("dataExpedicao"),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type DadosPessoais = typeof dadosPessoais.$inferSelect;
export type InsertDadosPessoais = typeof dadosPessoais.$inferInsert;

/**
 * Relações entre tabelas
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  inscricoes: many(inscricoes),
  dadosPessoais: one(dadosPessoais),
}));

export const concursosRelations = relations(concursos, ({ many }) => ({
  inscricoes: many(inscricoes),
}));

export const inscricoesRelations = relations(inscricoes, ({ one }) => ({
  usuario: one(users, {
    fields: [inscricoes.usuarioId],
    references: [users.id],
  }),
  concurso: one(concursos, {
    fields: [inscricoes.concursoId],
    references: [concursos.id],
  }),
}));

export const dadosPessoaisRelations = relations(dadosPessoais, ({ one }) => ({
  usuario: one(users, {
    fields: [dadosPessoais.usuarioId],
    references: [users.id],
  }),
}));

// TODO: Add your tables here