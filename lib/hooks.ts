'use client'

import { useMemo, useCallback, useRef } from 'react'
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
  const STORAGE_PREFIX = 'finance_dashboard_transactions'
  const requestStateRef = useRef(new Map<string, { inProgress: boolean; backoffAttempts: number }>())

  const getLocalTransactions = useCallback((userId: string): Transaction[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [STORAGE_PREFIX])

  const setLocalTransactions = useCallback(
    (userId: string, transactions: Transaction[]) => {
      if (typeof window === 'undefined') return
      localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(transactions))
    },
    [STORAGE_PREFIX]
  )

  const getTransactions = useCallback(async (userId: string, filters = {}) => {
    const requestState = requestStateRef.current
    const currentState = requestState.get(userId) ?? { inProgress: false, backoffAttempts: 0 }

    if (currentState.inProgress) {
      console.warn('Requisição de transações já em andamento, usando fallback local')
      return getLocalTransactions(userId)
    }

    currentState.inProgress = true
    requestState.set(userId, currentState)

    try {
      const response = await api.get(`/transactions/user/${userId}`, {
        params: filters,
      })

      currentState.backoffAttempts = 0
      return getLocalTransactions(userId).length > 0
        ? [...response.data, ...getLocalTransactions(userId)]
        : response.data
    } catch (error) {
      const typedError = error as { response?: { status?: number } }
      const statusCode = typedError?.response?.status
      console.warn('Usando fallback local para transações', error)

      if (statusCode === 429 && currentState.backoffAttempts < 3) {
        currentState.backoffAttempts += 1
        const backoffMs = 500 * 2 ** (currentState.backoffAttempts - 1)
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
      }

      return getLocalTransactions(userId)
    } finally {
      currentState.inProgress = false
      requestState.set(userId, currentState)
    }
  }, [getLocalTransactions])

  const createTransaction = useCallback(
    async (userId: string, data: CreateTransactionRequest) => {
      try {
        const response = await api.post('/transactions', {
          ...data,
          user_id: userId,
        })
        return response.data
      } catch (error) {
        console.warn('Falha ao criar transação no servidor, usando fallback local', error)
        const localTransactions = getLocalTransactions(userId)
        const newTransaction: Transaction = {
          id: `local-${Date.now()}`,
          user_id: userId,
          name: data.name,
          date: data.date,
          amount: data.amount,
          type: data.type,
          created_at: new Date().toISOString(),
        }
        const updated = [...localTransactions, newTransaction]
        setLocalTransactions(userId, updated)
        return newTransaction
      }
    },
    [getLocalTransactions, setLocalTransactions]
  )

  const updateTransaction = useCallback(
    async (transactionId: string, data: Partial<Transaction>) => {
      try {
        const response = await api.patch(`/transactions/${transactionId}`, data)
        return response.data
      } catch (error) {
        console.warn('Falha ao atualizar transação no servidor, atualizando fallback local', error)
        const allKeys = Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_PREFIX))
        for (const key of allKeys) {
          const stored = localStorage.getItem(key)
          if (!stored) continue
          const transactions: Transaction[] = JSON.parse(stored)
          const updated = transactions.map((transaction) =>
            transaction.id === transactionId ? { ...transaction, ...data, updated_at: new Date().toISOString() } : transaction
          )
          localStorage.setItem(key, JSON.stringify(updated))
        }
        return { id: transactionId, ...data } as Transaction
      }
    },
    []
  )

  const deleteTransaction = useCallback(async (transactionId: string) => {
    try {
      const response = await api.delete(`/transactions/${transactionId}`)
      return response.data
    } catch (error) {
      console.warn('Falha ao deletar transação no servidor, removendo do fallback local', error)
      const allKeys = Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_PREFIX))
      for (const key of allKeys) {
        const stored = localStorage.getItem(key)
        if (!stored) continue
        const transactions: Transaction[] = JSON.parse(stored)
        const updated = transactions.filter((transaction) => transaction.id !== transactionId)
        localStorage.setItem(key, JSON.stringify(updated))
      }
      return { success: true }
    }
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
