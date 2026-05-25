# Simple Finance Dashboard - Frontend

Dashboard financeiro moderno e responsivo construído com Next.js, TypeScript e Tailwind CSS.

## 📋 Estrutura do Projeto

```
app/
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

Arquivo `.env.local` (já criado):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Build para produção

```bash
npm run build
npm start
```

## 🔗 Integração com API

A API deve estar rodando em http://localhost:8080

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

- [ ] Página de Análise
- [ ] Modal criar/editar transações
- [ ] Filtros por período
- [ ] Exportar relatórios
