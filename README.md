# Simple Finance Dashboard - Frontend

Dashboard financeiro moderno e responsivo construído com Next.js, TypeScript e Tailwind CSS.

## 📋 Estrutura do Projeto

```
app/
├── analise/         # Gráficos e resumos por mês/ano
├── dashboard/       # Página principal do dashboard
├── login/           # Página de login
├── register/        # Página de registro
└── page.tsx         # Página raiz (redireciona baseado em autenticação)

components/
├── Sidebar.tsx      # Navegação lateral
├── Header.tsx       # Cabeçalho com controles
├── SummaryCard.tsx  # Cards de resumo (Ganhos, Gastos, etc)
├── TransactionsTable.tsx  # Tabela de transações
├── TransactionChart.tsx   # Gráfico de pizza
└── ProfileCard.tsx  # Card do perfil do usuário

lib/
├── api.ts           # Configuração Axios com interceptors
├── hooks.ts         # Hooks customizados para API
└── types.ts         # Tipos TypeScript
```

## 🚀 Como Usar

### 1. Instalação

```bash
npm install
```

### 2. Variáveis de ambiente

Crie `.env.local` na raiz do frontend (o arquivo é ignorado pelo Git):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Iniciar a API

Em outro terminal, na pasta do repositório `finance-dashboard-api`:

```bash
npm install
cp .env.example .env
```

Configure no `.env` da API os dados do PostgreSQL e um `JWT_SECRET` forte. Para desenvolvimento local, permita a origem do frontend:

```env
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

Depois execute as migrações e inicie a API:

```bash
npm run migrations
npm run dev
```

A API oferece health check em `http://localhost:8080/health`.

### 4. Rodar o frontend

```bash
npm run dev
```

Acesse: http://localhost:3000. O backend precisa estar acessível pelo endereço configurado em `NEXT_PUBLIC_API_URL`.

### 5. Testes e build

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
npm start
```

## 🔗 Integração com API

O frontend usa JWT Bearer e consome as rotas de autenticação, usuários e transações do `finance-dashboard-api`. Em produção, configure `NEXT_PUBLIC_API_URL` para a URL HTTPS da API e inclua a origem HTTPS do frontend em `CORS_ORIGINS` no backend.

## 🎨 Design

Segue exatamente o protótipo Figma com:
- Tema escuro
- Layout com Sidebar
- Componentes reutilizáveis
- Responsivo

## 🚀 Deploy Vercel

```bash
NEXT_PUBLIC_API_URL=https://sua-api.com/api
```

## 📝 TODO

- [x] Página de Análise
- [x] Criar, editar e excluir transações
- [x] Filtro por mês e ano
- [x] Exportar transações em CSV
- [ ] Busca e paginação na lista
- [ ] Relatórios por categoria
- [ ] Sessão com cookie HttpOnly e expiração visível
- [x] Página de transações com listagem e criação
