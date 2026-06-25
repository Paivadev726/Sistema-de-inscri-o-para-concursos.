# DOCUMENTAÇÃO COMPLETA - PORTAL DE INSCRIÇÃO EM CONCURSOS PÚBLICOS

## 1. DESCRIÇÃO DO PROJETO - RESULTADOS DO BRIEFING

### 1.1 Contexto e Objetivo

O **Portal de Inscrição em Concursos Públicos** é um sistema web desenvolvido para facilitar o processo de inscrição de candidatos em concursos públicos. O projeto visa centralizar informações sobre concursos, permitir inscrições online com validações automáticas e fornecer um painel administrativo para gerenciamento de dados.

### 1.2 Problema Identificado

Candidatos enfrentam dificuldades para encontrar informações centralizadas sobre concursos públicos. Muitas vezes, precisam acessar múltiplos sites de diferentes bancas examinadoras. Além disso, o processo de inscrição é manual e propenso a erros.

### 1.3 Solução Proposta

Desenvolver uma plataforma centralizada onde:
- Candidatos visualizam todos os concursos disponíveis em um único lugar
- Realizam inscrições com validações automáticas (máscaras, cálculo de taxa)
- Acompanham o histórico de suas inscrições
- Administradores gerenciam concursos e inscrições

### 1.4 Público-Alvo

- **Candidatos:** Pessoas que buscam se inscrever em concursos públicos
- **Administradores:** Funcionários responsáveis por gerenciar concursos e inscrições

### 1.5 Benefícios Esperados

- Centralização de informações sobre concursos
- Redução de erros em inscrições
- Facilidade de acesso e navegação
- Controle administrativo eficiente
- Histórico completo de inscrições

---

## 2. REQUISITOS FUNCIONAIS

Os requisitos funcionais descrevem as funcionalidades práticas que o usuário terá contato para realizar operações no sistema.

### 2.1 Funcionalidades de Candidato

| ID | Funcionalidade | Descrição |
|---|---|---|
| RF-01 | Visualizar Concursos | Candidato pode visualizar lista de todos os concursos públicos disponíveis |
| RF-02 | Filtrar Concursos | Candidato pode filtrar concursos por status (Aberto, Previsto, Encerrado) |
| RF-03 | Buscar Concursos | Candidato pode buscar concursos por nome, cargo ou banca examinadora |
| RF-04 | Visualizar Detalhes | Candidato pode visualizar detalhes completos de um concurso |
| RF-05 | Se Inscrever | Candidato pode se inscrever em um concurso preenchendo formulário |
| RF-06 | Aplicar Máscaras | Sistema aplica automaticamente máscaras em CPF, telefone e CEP |
| RF-07 | Calcular Taxa | Sistema calcula automaticamente a taxa de inscrição |
| RF-08 | Aplicar Isenção | Sistema aplica isenção de taxa para doadores de sangue e baixa renda |
| RF-09 | Validar Campos | Sistema valida todos os campos obrigatórios antes de enviar |
| RF-10 | Visualizar Histórico | Candidato pode visualizar histórico de suas inscrições |
| RF-11 | Ver Status | Candidato pode visualizar status de cada inscrição (Confirmada, Cancelada) |
| RF-12 | Cancelar Inscrição | Candidato pode cancelar uma inscrição realizada |
| RF-13 | Editar Dados Pessoais | Candidato pode editar seus dados pessoais (CPF, data de nascimento, etc) |
| RF-14 | Fazer Login | Candidato pode fazer login na plataforma |
| RF-15 | Fazer Logout | Candidato pode fazer logout da plataforma |

### 2.2 Funcionalidades de Administrador

| ID | Funcionalidade | Descrição |
|---|---|---|
| RF-16 | Criar Concurso | Admin pode criar novo concurso com todos os dados |
| RF-17 | Editar Concurso | Admin pode editar informações de um concurso existente |
| RF-18 | Deletar Concurso | Admin pode deletar um concurso |
| RF-19 | Listar Concursos | Admin pode visualizar lista de todos os concursos |
| RF-20 | Visualizar Inscrições | Admin pode visualizar todas as inscrições realizadas |
| RF-21 | Filtrar Inscrições | Admin pode filtrar inscrições por status, concurso ou candidato |
| RF-22 | Editar Inscrição | Admin pode editar dados de uma inscrição |
| RF-23 | Deletar Inscrição | Admin pode deletar uma inscrição |
| RF-24 | Gerenciar Usuários | Admin pode visualizar e gerenciar dados de usuários |
| RF-25 | Gerar Relatórios | Admin pode gerar relatórios de inscrições e concursos |

### 2.3 Funcionalidades de Sistema

| ID | Funcionalidade | Descrição |
|---|---|---|
| RF-26 | Autenticação | Sistema autentica usuários via OAuth |
| RF-27 | Autorização | Sistema controla acesso baseado em roles (admin/candidato) |
| RF-28 | Persistência | Sistema persiste dados em banco de dados relacional |
| RF-29 | Validação | Sistema valida dados em múltiplas camadas (frontend e backend) |
| RF-30 | Responsividade | Sistema funciona em diferentes tamanhos de tela |

---

## 3. REQUISITOS NÃO-FUNCIONAIS

Os requisitos não-funcionais descrevem aspectos que não dependem exclusivamente da programação, mas são essenciais para o sistema funcionar adequadamente.

### 3.1 Desempenho

| ID | Requisito | Descrição |
|---|---|---|
| RNF-01 | Tempo de Carregamento | Páginas devem carregar em menos de 3 segundos |
| RNF-02 | Tempo de Resposta | Requisições ao servidor devem responder em menos de 2 segundos |
| RNF-03 | Capacidade | Sistema deve suportar até 10.000 usuários simultâneos |
| RNF-04 | Escalabilidade | Sistema deve ser escalável para crescimento futuro |

### 3.2 Segurança

| ID | Requisito | Descrição |
|---|---|---|
| RNF-05 | Autenticação | Apenas usuários autenticados podem acessar funcionalidades protegidas |
| RNF-06 | Autorização | Usuários só podem acessar dados que lhes pertencem |
| RNF-07 | Criptografia | Dados sensíveis devem ser criptografados em trânsito (HTTPS) |
| RNF-08 | Validação | Todas as entradas devem ser validadas contra injeção de código |
| RNF-09 | Backup | Banco de dados deve ter backup automático diário |

### 3.3 Confiabilidade

| ID | Requisito | Descrição |
|---|---|---|
| RNF-10 | Disponibilidade | Sistema deve estar disponível 99% do tempo |
| RNF-11 | Recuperação | Sistema deve recuperar-se de falhas em menos de 1 hora |
| RNF-12 | Integridade | Dados não devem ser corrompidos em caso de falha |

### 3.4 Usabilidade

| ID | Requisito | Descrição |
|---|---|---|
| RNF-13 | Interface Intuitiva | Interface deve ser fácil de usar sem treinamento |
| RNF-14 | Acessibilidade | Sistema deve ser acessível para pessoas com deficiência |
| RNF-15 | Documentação | Sistema deve ter documentação clara e completa |

### 3.5 Compatibilidade

| ID | Requisito | Descrição |
|---|---|---|
| RNF-16 | Navegadores | Funcionar em Chrome, Firefox, Safari e Edge |
| RNF-17 | Dispositivos | Funcionar em desktop, tablet e mobile |
| RNF-18 | Banda Larga | Requer conexão de internet mínima de 1 Mbps |
| RNF-19 | Sistema Operacional | Funcionar em Windows, macOS e Linux |

### 3.6 Manutenibilidade

| ID | Requisito | Descrição |
|---|---|---|
| RNF-20 | Código Limpo | Código deve ser bem estruturado e comentado |
| RNF-21 | Testes | Sistema deve ter cobertura de testes de pelo menos 80% |
| RNF-22 | Documentação Técnica | Deve haver documentação técnica completa |

---

## 4. REGRAS DE NEGÓCIO

As regras de negócio descrevem o que o cliente quer que obrigatoriamente seja implementado.

### 4.1 Regras de Inscrição

| ID | Regra | Descrição |
|---|---|---|
| RN-01 | Autenticação Obrigatória | Apenas usuários autenticados podem se inscrever em concursos |
| RN-02 | Uma Inscrição por Concurso | Um candidato não pode se inscrever duas vezes no mesmo concurso |
| RN-03 | Período de Inscrição | Inscrições só são aceitas dentro do período definido (data início a data fim) |
| RN-04 | Validação de CPF | CPF deve ser válido (11 dígitos, não todos iguais) |
| RN-05 | Validação de Telefone | Telefone deve ter formato válido (10 ou 11 dígitos) |
| RN-06 | Validação de CEP | CEP deve ter formato válido (8 dígitos) |

### 4.2 Regras de Taxa

| ID | Regra | Descrição |
|---|---|---|
| RN-07 | Taxa Padrão | Taxa padrão é o valor definido no concurso |
| RN-08 | Isenção Doador | Doadores de sangue têm isenção de 100% da taxa |
| RN-09 | Isenção Baixa Renda | Pessoas de baixa renda têm isenção de 100% da taxa |
| RN-10 | Cálculo Automático | Taxa deve ser calculada automaticamente no formulário |
| RN-11 | Confirmação de Taxa | Candidato deve confirmar o valor da taxa antes de enviar |

### 4.3 Regras de Concurso

| ID | Regra | Descrição |
|---|---|---|
| RN-12 | Status Ativo | Apenas concursos com status "ativo" aparecem para candidatos |
| RN-13 | Vagas Limitadas | Concurso deve ter número de vagas definido |
| RN-14 | Banca Definida | Concurso deve ter banca examinadora definida |
| RN-15 | Datas Obrigatórias | Concurso deve ter data de início e fim de inscrições |

### 4.4 Regras de Acesso

| ID | Regra | Descrição |
|---|---|---|
| RN-16 | Admin Exclusivo | Apenas usuários com role "admin" podem acessar painel administrativo |
| RN-17 | Dados Pessoais | Candidato só pode ver seus próprios dados |
| RN-18 | Histórico Pessoal | Candidato só pode ver suas próprias inscrições |
| RN-19 | Admin Acesso Total | Admin pode ver dados de todos os usuários e inscrições |

### 4.5 Regras de Cancelamento

| ID | Regra | Descrição |
|---|---|---|
| RN-20 | Cancelamento Permitido | Candidato pode cancelar inscrição a qualquer momento |
| RN-21 | Data de Cancelamento | Sistema deve registrar data e hora do cancelamento |
| RN-22 | Status Cancelada | Inscrição cancelada deve ter status "cancelada" |

---

## 5. DIAGRAMA DE CASO DE USO

O diagrama de caso de uso demonstra a interação do usuário com o sistema. As elipses representam as funcionalidades do sistema.

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

## 6. DIAGRAMA DE CLASSE

O diagrama de classe demonstra a estrutura física das classes a serem implementadas.

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
│ - concursoId: int (FK)       │    │    (UNIQUE)               │
│ - cpf: string                │    │ - cpf: string (UNIQUE)    │
│ - telefone: string           │    │ - dataNascimento: date    │
│ - cep: string                │    │ - genero: enum            │
│ - endereco: string           │    │ - nacionalidade: string   │
│ - numero: string             │    │ - mae: string             │
│ - bairro: string             │    │ - rg: string              │
│ - cidade: string             │    │ - atualizadoEm: timestamp │
│ - estado: string             │    ├───────────────────────────┤
│ - taxaInscricao: decimal     │    │ + obterDados()            │
│ - isencao: enum              │    │ + atualizarDados()        │
│ - status: enum               │    └───────────────────────────┘
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

## 7. DIAGRAMA DE FLUXO DO SISTEMA

O diagrama de fluxo mostra o fluxo principal de inscrição em um concurso.

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

## 8. WIREFRAME - RASCUNHO INICIAL DAS PÁGINAS

### 8.1 Wireframe - Página Inicial

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO          Portal de Concursos     [Login] [Cadastro]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Encontre e se inscreva em concursos públicos        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Abertos  │  │Previstos │  │Encerrados│                 │
│  │    5     │  │    3     │  │    2     │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Buscar por nome, cargo ou banca...                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Todos] [Abertos] [Previstos] [Encerrados]               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Concurso 1       │  │ Concurso 2       │               │
│  │ Cargo: ...       │  │ Cargo: ...       │               │
│  │ Vagas: 50        │  │ Vagas: 30        │               │
│  │ Taxa: R$ 150     │  │ Taxa: R$ 120     │               │
│  │ [Se Inscrever]   │  │ [Se Inscrever]   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Concurso 3       │  │ Concurso 4       │               │
│  │ Cargo: ...       │  │ Cargo: ...       │               │
│  │ Vagas: 100       │  │ Vagas: 80        │               │
│  │ Taxa: R$ 100     │  │ Taxa: R$ 200     │               │
│  │ [Se Inscrever]   │  │ [Se Inscrever]   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ © 2026 Portal de Concursos. Todos os direitos reservados.  │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Wireframe - Formulário de Inscrição

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO          Portal de Concursos     [Meu Painel]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Formulário de Inscrição - Concurso XYZ                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DADOS PESSOAIS                                      │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ CPF: [___.____.___-__]                              │  │
│  │ Telefone: [(__) _____-____]                         │  │
│  │ CEP: [_____-___]                                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ENDEREÇO                                            │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Endereço: [_____________________]                   │  │
│  │ Número: [____]  Complemento: [_______]             │  │
│  │ Bairro: [_____________________]                     │  │
│  │ Cidade: [_____________________]                     │  │
│  │ Estado: [__]                                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ISENÇÃO DE TAXA                                     │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ ( ) Nenhuma isenção                                 │  │
│  │ ( ) Doador de sangue                                │  │
│  │ ( ) Baixa renda                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TAXA DE INSCRIÇÃO: R$ 150,00                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Cancelar]                            [Confirmar Inscrição]│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ © 2026 Portal de Concursos. Todos os direitos reservados.  │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Wireframe - Painel do Candidato

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO          Portal de Concursos     [Sair]               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Bem-vindo, João Silva!                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ HISTÓRICO DE INSCRIÇÕES                             │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Concurso | Cargo | Status | Data | Ações           │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Concurso 1 | Analista | Confirmada | 01/06/2026 │  │
│  │                                    [Cancelar]       │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Concurso 2 | Técnico | Cancelada | 15/06/2026 │   │  │
│  │                                    [Reincrever]    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ DADOS PESSOAIS                                      │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ CPF: 123.456.789-00                                 │  │
│  │ Data de Nascimento: 01/01/1990                      │  │
│  │ Gênero: Masculino                                   │  │
│  │ Nacionalidade: Brasileira                           │  │
│  │                                    [Editar]         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ © 2026 Portal de Concursos. Todos os direitos reservados.  │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Wireframe - Painel Administrativo

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO          Portal de Concursos     [Admin] [Sair]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Concursos] [Inscrições] [Usuários] [Relatórios]          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ GERENCIAR CONCURSOS                                 │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ [+ Novo Concurso]                                   │  │
│  │                                                     │  │
│  │ ID | Nome | Cargo | Vagas | Status | Ações        │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 1 | Concurso 1 | Analista | 50 | Ativo | [E][D]   │  │
│  │ 2 | Concurso 2 | Técnico | 30 | Ativo | [E][D]    │  │
│  │ 3 | Concurso 3 | Escriturário | 100 | Inativo | [E][D]│
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ GERENCIAR INSCRIÇÕES                                │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ ID | Candidato | Concurso | Status | Ações         │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 1 | João Silva | Concurso 1 | Confirmada | [E][D]  │  │
│  │ 2 | Maria Santos | Concurso 2 | Confirmada | [E][D]│  │
│  │ 3 | Pedro Costa | Concurso 1 | Cancelada | [E][D]  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ © 2026 Portal de Concursos. Todos os direitos reservados.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. PROTÓTIPO DE ALTA FIDELIDADE

O protótipo de alta fidelidade foi desenvolvido seguindo os wireframes e representa exatamente o que será implementado.

### 9.1 Características do Protótipo

- **Paleta de Cores:** Azul profissional (#0066CC), branco (#FFFFFF), cinza (#F5F5F5)
- **Tipografia:** Fonte sans-serif moderna (Inter, Roboto)
- **Componentes:** Botões, cards, inputs, tabelas com estilo consistente
- **Responsividade:** Design adaptativo para desktop, tablet e mobile
- **Interações:** Hover effects, transições suaves, feedback visual

### 9.2 Elementos Visuais Principais

#### Página Inicial
- Header com logo e botões de login/cadastro
- Barra de estatísticas com cards coloridos
- Campo de busca com ícone
- Filtros por status
- Grid de cards de concursos com sombra e hover effect
- Footer com informações

#### Formulário de Inscrição
- Seções bem definidas (Dados Pessoais, Endereço, Isenção)
- Inputs com labels e placeholders claros
- Máscaras visuais em tempo real
- Exibição dinâmica da taxa calculada
- Botões de ação (Cancelar, Confirmar)

#### Painel do Candidato
- Bem-vindo personalizado
- Tabela com histórico de inscrições
- Cards com dados pessoais
- Botões de ação (Cancelar, Editar)

#### Painel Administrativo
- Abas para diferentes seções
- Tabelas com dados estruturados
- Botões de ação (Editar, Deletar)
- Formulários para criar/editar concursos

### 9.3 Implementação do Protótipo

O protótipo foi implementado utilizando:
- **React 19** para componentes interativos
- **Tailwind CSS 4** para estilização
- **shadcn/ui** para componentes prontos
- **TypeScript** para tipagem estática
- **Responsive Design** para múltiplos dispositivos

---

## CONCLUSÃO

Este documento apresenta a documentação completa do **Portal de Inscrição em Concursos Públicos**, incluindo:

1. ✅ Descrição do projeto com resultados do briefing
2. ✅ Requisitos funcionais detalhados (30 funcionalidades)
3. ✅ Requisitos não-funcionais (22 requisitos)
4. ✅ Regras de negócio (22 regras)
5. ✅ Diagrama de caso de uso
6. ✅ Diagrama de classe
7. ✅ Diagrama de fluxo do sistema
8. ✅ Wireframes de todas as páginas principais
9. ✅ Protótipo de alta fidelidade implementado

O projeto está **100% pronto** para apresentação e atende a todos os requisitos especificados pelo professor.

---

**Data:** 15 de Junho de 2026  
**Versão:** 1.0.0  
**Status:** ✅ COMPLETO
