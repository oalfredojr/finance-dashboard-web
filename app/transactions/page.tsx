'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header, TransactionsTable, ProfileCard } from '@/components'
import { useAuth, useTransactions } from '@/lib/hooks'
import { Transaction, User } from '@/lib/types'

export default function TransactionsPage() {
  const router = useRouter()
  const { isAuthenticated, getCurrentUser } = useAuth()
  const { getTransactions, deleteTransaction } = useTransactions()

  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState('Janeiro')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)

    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    setUser(currentUser)
    loadTransactions(currentUser.id)
  }, [])

  const loadTransactions = async (userId: string) => {
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
  }

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

  if (!mounted || !isAuthenticated()) {
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
