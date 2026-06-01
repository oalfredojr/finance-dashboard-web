'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header, TransactionsTable, ProfileCard } from '@/components'
import { useAuth, useTransactions } from '@/lib/hooks'
import { Transaction, User } from '@/lib/types'

export default function TransactionsPage() {
  const router = useRouter()
  const { isAuthenticated, getCurrentUser } = useAuth()
  const { getTransactions, deleteTransaction } = useTransactions()

  const [user] = useState<User | null>(() => {
    try {
      return getCurrentUser()
    } catch {
      return null
    }
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState('Janeiro')
  const [, setLoading] = useState(true)
  const [mounted] = useState(() => typeof window !== 'undefined')
  const [error, setError] = useState('')

  const loadTransactions = useCallback(async (userId: string) => {
    setLoading(true)
    setError('')

    try {
      const data = await getTransactions(userId)
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar transações:', err)
      setError('Não foi possível carregar as transações no momento.')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [getTransactions])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Agendar em microtask para evitar render extra visível
    Promise.resolve().then(() => loadTransactions(currentUser.id))
  }, [getCurrentUser, isAuthenticated, loadTransactions, router])

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return

    try {
      await deleteTransaction(transactionId)
      await loadTransactions(user.id)
    } catch (err) {
      console.error('Erro ao deletar transação:', err)
      setError('Falha ao excluir a transação. Tente novamente.')
    }
  }

  const handleAddTransaction = () => {
    router.push('/transactions/new')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white">Transações</h1>
                  <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                    Consulte, adicione ou apague transações vinculadas ao seu perfil.
                  </p>
                </div>
                <button
                  onClick={handleAddTransaction}
                  className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
                >
                  Adicionar transação
                </button>
              </div>

              {error && (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
                  {error}
                </div>
              )}

              <TransactionsTable
                transactions={transactions}
                onAddNew={handleAddTransaction}
                onDelete={handleDeleteTransaction}
              />

              <ProfileCard user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}
