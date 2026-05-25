export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  name: string
  date: string
  amount: number
  type: 'EARNING' | 'EXPENSE' | 'INVESTMENT'
  created_at?: string
  updated_at?: string
}

export interface DashboardSummary {
  total_earnings: number
  total_expenses: number
  total_investments: number
  net_balance: number
}

export interface AuthToken {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface CreateTransactionRequest {
  name: string
  date: string
  amount: number
  type: 'EARNING' | 'EXPENSE' | 'INVESTMENT'
}
