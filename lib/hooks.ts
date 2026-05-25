'use client'

import { useRouter } from 'next/navigation'
import api from './api'
import {
  LoginRequest,
  RegisterRequest,
  User,
  Transaction,
  DashboardSummary,
  CreateTransactionRequest,
} from './types'

export const useAuth = () => {
  const router = useRouter()

  const login = async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/dashboard')
    return { token, user }
  }

  const register = async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getCurrentUser = (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }

  const isAuthenticated = (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token')
    }
    return false
  }

  return { login, register, logout, getCurrentUser, isAuthenticated }
}

export const useTransactions = () => {
  const getTransactions = async (userId: string, filters = {}) => {
    try {
      const response = await api.get(`/transactions/user/${userId}`, {
        params: filters,
      })
      return response.data
    } catch (error) {
      // Mock data para testes
      console.warn('Usando dados mock para transações')
      return [
        {
          id: '1',
          user_id: userId,
          name: 'Freelance',
          date: '2024-01-15',
          amount: 5200,
          type: 'EARNING',
        },
        {
          id: '2',
          user_id: userId,
          name: 'Pizza',
          date: '2024-01-09',
          amount: 139.9,
          type: 'EXPENSE',
        },
        {
          id: '3',
          user_id: userId,
          name: 'Tesouro Direto',
          date: '2024-01-12',
          amount: 1000,
          type: 'INVESTMENT',
        },
      ]
    }
  }

  const createTransaction = async (
    userId: string,
    data: CreateTransactionRequest
  ) => {
    const response = await api.post('/transactions', {
      ...data,
      user_id: userId,
    })
    return response.data
  }

  const updateTransaction = async (transactionId: string, data: Partial<Transaction>) => {
    const response = await api.patch(`/transactions/${transactionId}`, data)
    return response.data
  }

  const deleteTransaction = async (transactionId: string) => {
    const response = await api.delete(`/transactions/${transactionId}`)
    return response.data
  }

  return {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export const useDashboard = () => {
  const getDashboardSummary = async (
    userId: string,
    filters = {}
  ): Promise<DashboardSummary> => {
    try {
      const response = await api.get(`/transactions/dashboard/${userId}`, {
        params: filters,
      })
      return response.data
    } catch (error) {
      // Mock data para testes
      console.warn('Usando dados mock para dashboard')
      return {
        total_earnings: 5200,
        total_expenses: 2000,
        total_investments: 1000,
        net_balance: 2200,
      }
    }
  }

  return { getDashboardSummary }
}

export const useUser = () => {
  const getUserById = async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  }

  const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${userId}`, data)
    return response.data
  }

  return { getUserById, updateUser }
}
