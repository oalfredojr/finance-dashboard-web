'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from './api'
import {
  LoginRequest,
  RegisterRequest,
  User,
  Transaction,
  DashboardSummary,
  DashboardSummaryAPI,
  CreateTransactionRequest,
} from './types'

export const useAuth = () => {
  const router = useRouter()

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/dashboard')
    return { token, user }
  }, [router])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data)
    return response.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }, [router])

  const getCurrentUser = useCallback((): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }, [])

  const isAuthenticated = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token')
    }
    return false
  }, [])

  return useMemo(
    () => ({ login, register, logout, getCurrentUser, isAuthenticated }),
    [login, register, logout, getCurrentUser, isAuthenticated]
  )
}

export const useTransactions = () => {
  const getTransactions = useCallback(async (userId: string, filters = {}) => {
    const response = await api.get(`/transactions/user/${userId}`, {
      params: filters,
    })
    return response.data
  }, [])

  const createTransaction = useCallback(async (userId: string, data: CreateTransactionRequest) => {
    const response = await api.post('/transactions', {
      ...data,
      user_id: userId,
    })
    return response.data
  }, [])

  const updateTransaction = useCallback(async (transactionId: string, data: Partial<Transaction>) => {
    const response = await api.patch(`/transactions/${transactionId}`, data)
    return response.data
  }, [])

  const deleteTransaction = useCallback(async (transactionId: string) => {
    const response = await api.delete(`/transactions/${transactionId}`)
    return response.data
  }, [])

  return useMemo(
    () => ({ getTransactions, createTransaction, updateTransaction, deleteTransaction }),
    [getTransactions, createTransaction, updateTransaction, deleteTransaction]
  )
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
      const data: DashboardSummaryAPI = response.data
      return {
        total_earnings: data.totals.EARNING,
        total_expenses: data.totals.EXPENSE,
        total_investments: data.totals.INVESTMENT,
        net_balance: data.balance,
      }
    } catch (error) {
      console.warn('Usando dados mock para dashboard', error)
      return {
        total_earnings: 0,
        total_expenses: 0,
        total_investments: 0,
        net_balance: 0,
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
