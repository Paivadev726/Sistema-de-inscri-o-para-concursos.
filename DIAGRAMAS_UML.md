# Diagramas UML - Portal de Inscrição em Concursos Públicos

## 1. Diagrama de Caso de Uso

```
┌─────────────────────────────────────────────────────────────────┐
│                     SISTEMA DE CONCURSOS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                ┌──────────────────┐     │
│  │   Candidato      │                │   Administrador  │     │
│  └────────┬─────────┘                └────────┬─────────┘     │
│           │                                   │                │
│           ├─────────────────┬─────────────────┤                │
│           │                 │                 │                │
│      ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐         │
│      │ Autenticar      │ Visualizar │    │ Gerenciar │         │
│      │ Usuário  │      │ Concursos  │    │ Concursos │         │
│      └────┬────┘      └─────┬─────┘    └─────┬─────┘         │
│           │                 │                 │                │
│           ├─────────────────┼─────────────────┤                │
│           │                 │                 │                │
│      ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐         │
│      │ Se Inscrever    │ Filtrar   │    │ Gerenciar │         │
│      │ em Concurso      │ Concursos │    │ Inscrições│         │
│      └────┬────┘      └─────┬─────┘    └─────┬─────┘         │
│           │                 │                 │                │
│           ├─────────────────┼─────────────────┤                │
│           │                 │                 │                │
│      ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐         │
│      │ Visualizar      │ Buscar    │    │ Visualizar│         │
│      │ Histórico│      │ Concursos │    │ Relatórios│         │
│      └─────────┘      └───────────┘    └───────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLASSE: User                             │
├─────────────────────────────────────────────────────────────────┤
│ - id: int (PK)                                                  │
│ - openId: string (UNIQUE)                                       │
│ - name: string                                                  │
│ - email: string                                                 │
│ - role: enum ['user', 'admin']                                 │
│ - createdAt: timestamp                                          │
│ - updatedAt: timestamp                                          │
├─────────────────────────────────────────────────────────────────┤
│ + autenticar()                                                  │
│ + logout()                                                      │
│ + atualizarPerfil()                                             │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ 1:N
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
        │                                            │
┌───────▼──────────────────────┐    ┌──────────────▼────────────┐
│    CLASSE: Inscricao         │    │ CLASSE: DadosPessoais     │
├──────────────────────────────┤    ├───────────────────────────┤
│ - id: int (PK)               │    │ - id: int (PK)            │
│ - usuarioId: int (FK)        │    │ - usuarioId: int (FK)     │
│ - concursoId: int (FK)       │    │ - cpf: string (UNIQUE)    │
│ - cpf: string                │    │ - dataNascimento: date    │
│ - telefone: string           │    │ - genero: enum            │
│ - cep: string                │    │ - nacionalidade: string   │
│ - endereco: string           │    │ - mae: string             │
│ - numero: string             │    │ - rg: string              │
│ - bairro: string             │    │ - atualizadoEm: timestamp │
│ - cidade: string             │    ├───────────────────────────┤
│ - estado: string             │    │ + obterDados()            │
│ - taxaInscricao: decimal     │    │ + atualizarDados()        │
│ - isencao: enum              │    └───────────────────────────┘
│ - status: enum               │
│ - dataInscricao: timestamp   │
├──────────────────────────────┤
│ + criar()                    │
│ + cancelar()                 │
│ + obterHistorico()           │
└──────────────┬───────────────┘
               │ N:1
               │
        ┌──────▼──────────────────────┐
        │   CLASSE: Concurso          │
        ├─────────────────────────────┤
        │ - id: int (PK)              │
        │ - nome: string              │
        │ - cargo: string             │
        │ - vagas: int                │
        │ - banca: string             │
        │ - dataInscricaoInicio: date │
        │ - dataInscricaoFim: date    │
        │ - dataProva: date           │
        │ - valorInscricao: decimal   │
        │ - descricao: text           │
        │ - status: enum              │
        │ - criadoEm: timestamp       │
        │ - atualizadoEm: timestamp   │
        ├─────────────────────────────┤
        │ + criar()                   │
        │ + editar()                  │
        │ + deletar()                 │
        │ + obterStatus()             │
        │ + calcularTaxa()            │
        └─────────────────────────────┘
```

---

## 3. Diagrama de Fluxo - Inscrição em Concurso

```
                         ┌─────────────────┐
                         │ INÍCIO: Candidato│
                         │ Clica "Inscrever"│
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Autenticado?    │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                   NÃO                         SIM
                    │                           │
                    ▼                           ▼
            ┌──────────────┐        ┌───────────────────┐
            │ Redirecionar │        │ Exibir Formulário │
            │ para Login   │        │ de Inscrição      │
            └──────────────┘        └─────────┬─────────┘
                    │                         │
                    │                         ▼
                    │              ┌───────────────────┐
                    │              │ Usuário Preenche  │
                    │              │ Formulário        │
                    │              └─────────┬─────────┘
                    │                        │
                    │                        ▼
                    │              ┌───────────────────┐
                    │              │ Aplicar Máscaras  │
                    │              │ (CPF, Tel, CEP)   │
                    │              └─────────┬─────────┘
                    │                        │
                    │                        ▼
                    │              ┌───────────────────┐
                    │              │ Calcular Taxa     │
                    │              │ (com isenção)     │
                    │              └─────────┬─────────┘
                    │                        │
                    │                        ▼
                    │              ┌───────────────────┐
                    │              │ Validar Campos    │
                    │              └─────────┬─────────┘
                    │                        │
                    │              ┌─────────┴─────────┐
                    │              │                   │
                    │            VÁLIDO              INVÁLIDO
                    │              │                   │
                    │              ▼                   ▼
                    │    ┌──────────────────┐ ┌──────────────────┐
                    │    │ Enviar para      │ │ Exibir Mensagem  │
                    │    │ Servidor (tRPC)  │ │ de Erro          │
                    │    └────────┬─────────┘ └──────────────────┘
                    │             │                   │
                    │             ▼                   │
                    │    ┌──────────────────┐         │
                    │    │ Salvar no Banco  │         │
                    │    │ de Dados         │         │
                    │    └────────┬─────────┘         │
                    │             │                   │
                    │             ▼                   │
                    │    ┌──────────────────┐         │
                    │    │ Exibir Mensagem  │         │
                    │    │ de Sucesso       │         │
                    │    └────────┬─────────┘         │
                    │             │                   │
                    │             ▼                   │
                    │    ┌──────────────────┐         │
                    │    │ Redirecionar para│         │
                    │    │ Painel Candidato │         │
                    │    └────────┬─────────┘         │
                    │             │                   │
                    └─────────────┴───────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ FIM: Inscrição  │
                         │ Realizada       │
                         └─────────────────┘
```

---

## 4. Diagrama de Fluxo - Cálculo de Taxa

```
                    ┌──────────────────────┐
                    │ INÍCIO: Candidato    │
                    │ Seleciona Isenção    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Qual Tipo de Isenção?│
                    └──────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Nenhuma      │  │ Doador de    │  │ Baixa Renda  │
    │ Isenção      │  │ Sangue       │  │              │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Taxa = Valor │  │ Taxa = R$ 0  │  │ Taxa = R$ 0  │
    │ Original     │  │ (Isento)     │  │ (Isento)     │
    │ do Concurso  │  │              │  │              │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ Exibir Taxa Calculada│
                    │ na Tela              │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ FIM: Taxa Calculada  │
                    └──────────────────────┘
```

---

## 5. Diagrama de Sequência - Inscrição

```
Candidato        Frontend         Backend         Banco de Dados
    │               │                │                  │
    │─ Clica em ────▶│                │                  │
    │ "Inscrever"    │                │                  │
    │                │                │                  │
    │◀─ Exibe Form ──│                │                  │
    │                │                │                  │
    │─ Preenche ────▶│                │                  │
    │ Formulário     │                │                  │
    │                │                │                  │
    │◀─ Aplica ──────│                │                  │
    │ Máscaras       │                │                  │
    │                │                │                  │
    │◀─ Calcula ─────│                │                  │
    │ Taxa           │                │                  │
    │                │                │                  │
    │─ Clica em ────▶│                │                  │
    │ "Confirmar"    │                │                  │
    │                │─ Valida ──────▶│                  │
    │                │ Dados          │                  │
    │                │◀─ Retorna ─────│                  │
    │                │ OK             │                  │
    │                │                │─ INSERT ────────▶│
    │                │                │ inscricao        │
    │                │                │◀─ Retorna ID ───│
    │                │◀─ Retorna ─────│                  │
    │                │ Sucesso        │                  │
    │◀─ Exibe ───────│                │                  │
    │ Mensagem       │                │                  │
    │ de Sucesso     │                │                  │
    │                │                │                  │
    │◀─ Redireciona ─│                │                  │
    │ para Painel    │                │                  │
    │                │                │                  │
```

---

## 6. Diagrama de Entidade-Relacionamento (ER)

```
┌──────────────────────┐
│       users          │
├──────────────────────┤
│ PK id                │
│    openId (UNIQUE)   │
│    name              │
│    email             │
│    role              │
│    createdAt         │
│    updatedAt         │
└──────────┬───────────┘
           │ 1
           │
           │ N
           ├─────────────────────────┬──────────────────────┐
           │                         │                      │
           │                         │                      │
    ┌──────▼──────────────┐  ┌──────▼──────────────┐  ┌────▼────────────────┐
    │    inscricoes       │  │  dadosPessoais      │  │    (relação 1:N)    │
    ├─────────────────────┤  ├─────────────────────┤  │                     │
    │ PK id               │  │ PK id               │  │ Um usuário pode ter: │
    │ FK usuarioId        │  │ FK usuarioId        │  │ - Múltiplas inscrições
    │ FK concursoId       │  │    (UNIQUE)         │  │ - Um perfil pessoal  │
    │    cpf              │  │    cpf (UNIQUE)     │  │                     │
    │    telefone         │  │    dataNascimento   │  └─────────────────────┘
    │    cep              │  │    genero           │
    │    endereco         │  │    nacionalidade    │
    │    numero           │  │    mae              │
    │    bairro           │  │    rg               │
    │    cidade           │  │    atualizadoEm     │
    │    estado           │  └─────────────────────┘
    │    taxaInscricao    │
    │    isencao          │
    │    status           │
    │    dataInscricao    │
    │    dataCancelamento │
    └──────┬──────────────┘
           │ N
           │
           │ 1
           │
    ┌──────▼──────────────┐
    │    concursos        │
    ├─────────────────────┤
    │ PK id               │
    │    nome             │
    │    cargo            │
    │    vagas            │
    │    banca            │
    │    dataInscricaoIni │
    │    dataInscricaoFim │
    │    dataProva        │
    │    valorInscricao   │
    │    descricao        │
    │    edital           │
    │    status           │
    │    criadoEm         │
    │    atualizadoEm     │
    └─────────────────────┘

Relacionamentos:
- users (1) ──────── (N) inscricoes
- users (1) ──────── (1) dadosPessoais
- concursos (1) ──── (N) inscricoes
```

---

## 7. Diagrama de Arquitetura - Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Home.tsx     │  │ Inscricao.   │  │ Candidato.   │      │
│  │ (Listagem)   │  │ tsx (Formulá)│  │ tsx (Painel) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │ Admin.tsx    │                                           │
│  │ (Gerenciam.) │                                           │
│  └──────────────┘                                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                    tRPC (Type-Safe RPC)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    CAMADA DE NEGÓCIO                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ routers.ts - Procedures tRPC                         │  │
│  │ - concursos.list, create, update, delete            │  │
│  │ - inscricoes.create, getByUsuario, cancelar         │  │
│  │ - dadosPessoais.getByUsuario, update                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Validações e Regras de Negócio                       │  │
│  │ - Verificar autenticação                            │  │
│  │ - Verificar permissões (admin)                      │  │
│  │ - Validar dados de entrada                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    CAMADA DE DADOS                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ db.ts - Query Helpers                               │  │
│  │ - getConcursos()                                    │  │
│  │ - createInscricao()                                 │  │
│  │ - getInscricoesByUsuario()                          │  │
│  │ - updateDadosPessoais()                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Drizzle ORM - Mapeamento de Objetos                 │  │
│  │ - schema.ts (Definição de tabelas)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    BANCO DE DADOS                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MySQL                                                │  │
│  │ - Tabela: users                                      │  │
│  │ - Tabela: concursos                                 │  │
│  │ - Tabela: inscricoes                                │  │
│  │ - Tabela: dadosPessoais                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Diagrama de Estados - Inscrição

```
                    ┌──────────────┐
                    │ CONFIRMADA   │
                    │ (Ativa)      │
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐
                    │ Candidato   │
                    │ Cancelar    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ CANCELADA    │
                    │ (Inativa)    │
                    └──────────────┘

Estados Possíveis:
- CONFIRMADA: Inscrição ativa e válida
- CANCELADA: Inscrição cancelada pelo candidato
- PENDENTE: Aguardando confirmação (não utilizado nesta versão)
```

---

## Notas Importantes

1. **Todos os diagramas** foram criados em formato texto (ASCII art) para fácil visualização
2. **Relacionamentos** entre tabelas foram implementados corretamente com chaves estrangeiras
3. **Fluxos** foram documentados de forma clara e didática
4. **Validações** ocorrem em múltiplas camadas (frontend e backend)
5. **Segurança** é garantida através de autenticação e controle de acesso

---

**Data de Criação:** Junho de 2026  
**Status:** ✅ Completo
