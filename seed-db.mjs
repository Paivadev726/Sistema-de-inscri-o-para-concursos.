// Script simples para popular o banco de dados com dados de exemplo
// Executar com: node seed-db.mjs

import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "test",
});

console.log("✓ Conectado ao banco de dados");

// Inserir concursos de exemplo
const concursos = [
  {
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
    status: "ativo",
  },
  {
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
    status: "ativo",
  },
  {
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
    status: "ativo",
  },
  {
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
    status: "ativo",
  },
  {
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
    status: "ativo",
  },
];

// Inserir concursos
for (const concurso of concursos) {
  try {
    await connection.execute(
      `INSERT INTO concursos (nome, cargo, vagas, banca, dataInscricaoInicio, dataInscricaoFim, dataProva, valorInscricao, descricao, edital, status, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        concurso.nome,
        concurso.cargo,
        concurso.vagas,
        concurso.banca,
        concurso.dataInscricaoInicio,
        concurso.dataInscricaoFim,
        concurso.dataProva,
        concurso.valorInscricao,
        concurso.descricao,
        concurso.edital,
        concurso.status,
      ]
    );
    console.log(`✓ Concurso inserido: ${concurso.nome}`);
  } catch (erro) {
    console.error(`✗ Erro ao inserir ${concurso.nome}:`, erro.message);
  }
}

console.log("\n✓ Banco de dados populado com sucesso!");
await connection.end();
