# Chrímata — Sistema de Gestão Financeira Pessoal e Educação Financeira

Plano oficial de arquitectura e implementação para a plataforma **Chrímata**, concebida para capacitar estudantes e trabalhadores a controlarem as suas finanças pessoais com qualidade, clareza e literacia financeira contínua.

---

## Revisão e Decisões Críticas Confirmadas

> [!IMPORTANT]
> Decisões alinhadas com o utilizador na Fase de Clarificação:
> - **Backend & API**: Full-stack TypeScript com API REST em Express + base de dados relacional PostgreSQL (com camada de dados tipada e resiliente).
> - **Moeda & Localização**: Kwanza Angolano (AOA, Kz) com formatação em Português (`125.000,00 Kz`), suporte a termos e convenções financeiras locais.
> - **Escopo Nuclear do MVP**: Rastreio de Transacções, Orçamentos por categoria com alertas, Painel de Métricas e Análises (Analytics), e Módulo Interactivo de Educação Financeira (dicas práticas, regra 50/30/20, simulador de poupança e glossário).

---

## 1. Análise Global e Escopo

### 1.1 O que é o Chrímata
Uma aplicação web responsiva que transforma a gestão financeira pessoal de uma tarefa enfadonha numa experiência visual intuitiva, orientada a dados e educativa. O sistema combina registo ágil de receitas/despesas, planeamento orçamental visual e pílulas de literacia financeira aplicáveis à realidade diária.

### 1.2 Público-Alvo e Casos de Uso
1. **Estudantes**: Controlo de mesadas, bolsas, despesas académicas, transportes e criação de hábitos de poupança desde cedo.
2. **Trabalhadores**: Gestão de salários, custos fixos (renda, alimentação, serviços públicos), despesas supérfluas e metas de reserva de emergência.
3. **Administrador**: Supervisão técnica de categorias do sistema, parâmetros monetários e estatísticas agregadas anónimas de uso.

### 1.3 Análise de Requisitos Incompletos no Documento Original
- **Gestão de Categorias**: O documento original não detalhava a taxonomia padrão. Definimos categorias padrão para receitas (*Salário, Bolsas, Freelance, Investimentos, Outros*) e despesas (*Alimentação, Transporte, Habitação, Educação, Saúde, Lazer, Poupança*).
- **Periodicidade dos Orçamentos**: O documento mencionava orçamentos genéricos. O sistema implementará orçamentos mensais com cálculo automático da percentagem gasta e previsão de saldo restante.
- **Módulo de Educação Financeira**: Detalhamos conteúdos práticos: Regra 50/30/20 adaptada, simulador de fundo de emergência, cálculo de juros simples/compostos e dicas diárias contextualizadas ao saldo do utilizador.

### 1.4 Identificação de Conflitos e Resoluções
- **Conflito Python/Django vs Ambiente AI Studio**: O documento mencionava Django + Simple JWT. No ambiente da plataforma AI Studio (Node.js/TypeScript nativo), foi aprovada a implementação Full-stack TypeScript com Express REST API. As rotas e contratos de API seguirão o padrão REST limpo especificado (`/api/auth/*`, `/api/transactions/*`, `/api/budgets/*`, etc.) com tokens JWT seguros e hash de password com bcrypt.
- **Conflito PostgreSQL / Infraestrutura**: Garantiremos arquitectura desacoplada através de um repositório de dados com Drizzle/Postgres e fallback para persistência em memória/IndexedDB persistente caso os parâmetros externos de PostgreSQL estejam a ser aprovisionados.

### 1.5 Riscos Técnicos e Medidas de Mitigação
1. **Precisão Numérica Financeira**: Operações financeiras com floats em JavaScript podem gerar erros de arredondamento.
   - *Mitigação*: Armazenamento em cêntimos inteiros (`integer` em base de dados) ou `numeric(14,2)` e utilitário centralizado de formatação cambial com `Intl.NumberFormat('pt-AO')`.
2. **Perda de Dados em Sessões Móveis**: Estudantes e trabalhadores acedem frequentemente via smartphones em ligações instáveis.
   - *Mitigação*: Estado reactivo com persistência local sincronizada e validação imediata em cada transacção.
3. **Segurança de Autenticação**: Protecção contra acesso a dados entre diferentes utilizadores.
   - *Mitigação*: Middleware de autenticação JWT validando o `user_id` em todas as consultas SQL/ORM (`WHERE user_id = :req_user_id`).

---

## 2. Experiência do Utilizador e Design Visual

### 2.1 Identidade Visual e Princípios de Design
Seguindo o caderno de encargos e as directrizes anti-slop de SaaS financeiro:
- **Estilo**: Minimalista, moderno, profissional e financeiro.
- **Sem "Pill Slop"**: Metadados (datas, categorias, estados) apresentados em texto puro e legível com separadores discretos (`·` ou `/`).
- **Números Tabulares (`font-mono tabular-nums`)**: Todos os saldos, métricas, tabelas e gráficos utilizam números monoespaçados com alinhamento decimal vertical para eliminar oscilações de layout.
- **Cores Oficiais**:
  - Primária: Verde Financeiro `#16A34A` (crescimento, receitas, saldo positivo)
  - Secundária: Azul Petróleo / Teal `#0F766E` (estrutura, foco analítico)
  - Fundo Canvas: `#F8FAFC` (Slate ultra-leve para descanso visual)
  - Superfícies/Cartões: `#FFFFFF` com bordas finas `border-slate-200`
  - Texto Principal: `#0F172A` (Slate escuro de alto contraste WCAG AA)
  - Erro / Despesas: `#DC2626`
  - Aviso: `#D97706`
- **Tipografia**:
  - Títulos e Navegação: `Plus Jakarta Sans`
  - Texto e Formulários: `Inter`
  - Métricas e Valores Monetários: `JetBrains Mono` / `tabular-nums`

### 2.2 Estrutura de Telas e Navegação
1. **Landing Page (Pública)**:
   - Apresentação da missão do Chrímata, métricas de impacto educativo e chamada de acção directa para registo/login.
2. **Autenticação (Login & Registo)**:
   - Formulário limpo com validação em tempo real de e-mail e força de palavra-passe.
   - Alternância rápida para conta de demonstração (Estudante e Trabalhador pré-carregados).
3. **Dashboard Principal (Autenticado)**:
   - **Barra de Destaques (KPIs)**: Saldo Actual, Receitas do Mês, Despesas do Mês, e Taxa de Poupança.
   - **Orçamentos Rápidos**: Barras de progresso por categoria com indicador visual de limites.
   - **Transacções Recentes**: Lista limpa com ícones por categoria, data formatada e montante em Kz.
   - **Dica Financeira do Dia**: Conselho prático interactivo com micro-acção (ex.: "Revise os seus gastos supérfluos").
4. **Módulo de Transacções**:
   - Tabela e lista com filtros por tipo (Receita, Despesa), Categoria, Intervalo de Datas e Pesquisa por Descrição.
   - Modal rápido para nova transacção com categorias pré-definidas ou personalizadas.
5. **Módulo de Orçamentos (Budgets)**:
   - Criação de limites mensais por categoria.
   - Comparativo visual Orçado vs Realizado com alerta se ultrapassar 80% e 100%.
6. **Módulo Educativo (Literacia Financeira)**:
   - Guia Prático da Regra 50/30/20 aplicado automaticamente ao rendimento do utilizador.
   - Simulador Interactivo de Fundo de Emergência (3 a 6 meses de despesas básicas).
   - Glossário Financeiro prático para estudantes e novos trabalhadores.
7. **Perfil & Configurações**:
   - Dados pessoais, preferência de moeda e gestão de sessão.

---

## 3. Arquitectura Técnica do Sistema

### 3.1 Diagrama de Arquitectura

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                         │
│                                                                        │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────┐  │
│  │  Dashboard   │   │ Transacções  │   │ Orçamentos  │   │ Educação │  │
│  │   & KPIs     │   │   & Filtros  │   │  & Alertas  │   │  & Dicas │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬──────┘   └────┬─────┘  │
│         │                  │                  │               │        │
│  ┌──────┴──────────────────┴──────────────────┴───────────────┴─────┐  │
│  │          Contextos React & Estado (AuthContext, FinanceContext)    │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Chamadas HTTP REST (JSON)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express + TypeScript)                   │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │  Auth & JWT Security  │   │  Controllers & Business Validators   │  │
│  │  (/api/auth/*)        │   │  (/api/transactions, /api/budgets)   │  │
│  └──────────┬────────────┘   └──────────────────┬───────────────────┘  │
│             │                                   │                      │
│  ┌──────────┴───────────────────────────────────┴───────────────────┐  │
│  │              Camada de Serviços & Acesso a Dados                 │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Drizzle ORM / SQL Driver
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       BASE DE DADOS POSTGRESQL                         │
│                                                                        │
│    users ───< accounts ───< transactions >─── categories               │
│      │                                              ▲                  │
│      └──────────────────< budgets ──────────────────┘                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Dados Relacional (PostgreSQL)

### 4.1 Entidades e Estrutura

#### Tabela `users`
- `id` (UUID, Primary Key)
- `name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(20), DEFAULT 'user') — 'user' | 'admin'
- `profile_type` (VARCHAR(30), DEFAULT 'worker') — 'student' | 'worker'
- `currency` (VARCHAR(10), DEFAULT 'AOA')
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### Tabela `categories`
- `id` (UUID, Primary Key)
- `user_id` (UUID, NULLable para categorias do sistema global, FK -> users.id)
- `name` (VARCHAR(80), NOT NULL)
- `type` (VARCHAR(20), NOT NULL) — 'income' | 'expense'
- `icon` (VARCHAR(50), NOT NULL)
- `color` (VARCHAR(20), NOT NULL)
- `is_system` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### Tabela `transactions`
- `id` (UUID, Primary Key)
- `user_id` (UUID, NOT NULL, FK -> users.id, INDEXED)
- `category_id` (UUID, NOT NULL, FK -> categories.id)
- `title` (VARCHAR(150), NOT NULL)
- `amount` (NUMERIC(14,2), NOT NULL) — valor em Kz
- `type` (VARCHAR(20), NOT NULL) — 'income' | 'expense'
- `date` (DATE, NOT NULL)
- `description` (TEXT)
- `payment_method` (VARCHAR(50)) — 'transferencia' | 'multicaixa' | 'dinheiro' | 'outro'
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### Tabela `budgets`
- `id` (UUID, Primary Key)
- `user_id` (UUID, NOT NULL, FK -> users.id, INDEXED)
- `category_id` (UUID, NOT NULL, FK -> categories.id)
- `amount_limit` (NUMERIC(14,2), NOT NULL) — tecto mensal em Kz
- `month_year` (VARCHAR(7), NOT NULL) — formato 'YYYY-MM'
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### Tabela `educational_tips`
- `id` (UUID, Primary Key)
- `title` (VARCHAR(150), NOT NULL)
- `content` (TEXT, NOT NULL)
- `category` (VARCHAR(50), NOT NULL) — 'orcamento' | 'poupanca' | 'investimento' | 'dividas'
- `target_audience` (VARCHAR(30), DEFAULT 'all') — 'student' | 'worker' | 'all'
- `difficulty` (VARCHAR(20), DEFAULT 'iniciante')

---

## 5. Estrutura de Pastas Modular do Projecto

A estrutura seguirá o padrão enterprise modular em TypeScript:

```text
chrímata/
├── server/                    # Backend API em Node.js / Express
│   ├── index.ts               # Ponto de entrada do servidor Express
│   ├── config.ts              # Configurações de ambiente e portas
│   ├── middleware/
│   │   ├── auth.ts            # Validação de token JWT e permissões
│   │   └── errorHandler.ts    # Tratamento centralizado de erros
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── transactionController.ts
│   │   ├── budgetController.ts
│   │   └── educationController.ts
│   ├── db/
│   │   ├── schema.ts          # Definição das tabelas relacionais
│   │   ├── db.ts              # Conexão com PostgreSQL e orquestrador
│   │   └── seed.ts            # Dados fictícios para teste e inicialização
│   └── routes/                # Rotas da API REST (/api/*)
│       ├── auth.ts
│       ├── transactions.ts
│       ├── budgets.ts
│       └── education.ts
│
├── src/                       # Frontend SPA (React + TypeScript + Tailwind)
│   ├── main.tsx               # Bootstrap da aplicação
│   ├── App.tsx                # Roteador principal e protecção de rotas
│   ├── index.css              # Importação Tailwind CSS e estilos globais
│   ├── types/                 # Tipos TypeScript compartilhados
│   │   ├── user.ts
│   │   ├── transaction.ts
│   │   ├── budget.ts
│   │   └── education.ts
│   ├── contexts/              # Contextos de autenticação e dados financeiros
│   │   ├── AuthContext.tsx
│   │   └── FinanceContext.tsx
│   ├── components/            # Componentes visuais atómicos e reutilizáveis
│   │   ├── common/            # Buttons, Inputs, Cards, Badges, Modals
│   │   ├── layout/            # Navbar, Sidebar, Footer, MobileNav
│   │   ├── transactions/      # TransactionFormModal, TransactionList, TransactionFilter
│   │   ├── budgets/           # BudgetProgressBar, BudgetModal, BudgetSummary
│   │   ├── dashboard/         # MetricCard, ExpenseBreakdownChart, MonthlyCashflowChart
│   │   └── education/         # Rule503020Calculator, TipCard, GlossaryModal
│   ├── pages/                 # Páginas da aplicação
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── EducationPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminPage.tsx
│   ├── utils/                 # Formatadores cambiais (Kz), datas e cálculos
│   │   ├── currency.ts
│   │   └── date.ts
│   └── services/              # Cliente HTTP para a API REST
│       └── api.ts
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Lista de Dependências Necessárias

As dependências principais já instaladas na raiz:
- `react`, `react-dom` (^19.0.1)
- `express` (^4.21.2)
- `lucide-react` (^0.546.0) para ícones financeiros de alta legibilidade
- `motion` (^12.23.24) para transições suaves de abas e modais
- `@tailwindcss/vite` (^4.3.3) para estilização moderna e responsiva
- `tsx` para execução do servidor Express em desenvolvimento

Pacotes adicionais úteis a instalar de forma cirúrgica:
- `bcryptjs` + `@types/bcryptjs` (para hashing seguro de palavras-passe)
- `jsonwebtoken` + `@types/jsonwebtoken` (para emissão e validação de tokens JWT)
- `pg` + `@types/pg` (driver cliente para PostgreSQL)

---

## 7. Fases de Execução do Projecto (Roadmap)

### Fase 1: Fundação & Base de Dados
- Configuração de `metadata.json` e `<head>` com o nome e metatags de Chrímata.
- Configuração do servidor Express (`server/index.ts`) com proxy no Vite.
- Implementação do esquema de dados relacional e repositório de persistência com seed de dados de teste realistas (utilizador estudante e trabalhador com transacções em Kwanza).

### Fase 2: Autenticação & Autorização
- Endpoints de autenticação (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- Páginas de Login e Registo com validações visuais completas e protecção de rotas.

### Fase 3: Núcleo Financeiro (Transacções e Orçamentos)
- Endpoints e interface CRUD completa para Transacções (Receita/Despesa, Categorias, Métodos de pagamento).
- Módulo de Orçamentos com limites mensais, cálculo automático de consumo e barras visuais de alerta.

### Fase 4: Dashboard & Métricas
- Painel analítico com KPIs tabulares (Saldo, Receitas, Despesas, Poupança).
- Distribuição de despesas por categoria e fluxo temporal.

### Fase 5: Módulo de Educação Financeira & Perfil
- Simulador interactivo da regra 50/30/20 baseado nas receitas reais do utilizador.
- Dicas financeiras personalizadas para estudantes e trabalhadores.
- Perfil do utilizador com personalização e painel de administração.

---

## 8. Critérios de Aceitação

- [ ] Todas as transacções e orçamentos operam em Kwanza (Kz) com formatação monetária padrão angolano (`125.000,00 Kz`).
- [ ] Registo, Login e persistência de sessão JWT funcionam de ponta a ponta sem erros de consola.
- [ ] O utilizador consegue filtrar, adicionar, editar e remover transacções com actualização imediata do saldo.
- [ ] Os orçamentos alertam visualmente quando o consumo ultrapassa limites críticos.
- [ ] O módulo de educação financeira calcula a divisão 50/30/20 e disponibiliza conteúdos educativos práticos.
- [ ] A interface obedece a todas as directrizes de acessibilidade, contraste e responsividade em ecrãs móveis e desktop.
- [ ] O projecto compila com sucesso (`npm run build` e validação TypeScript sem erros).
