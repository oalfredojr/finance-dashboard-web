'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header, TransactionsTable } from '@/components'
import { useAuth, useTransactions } from '@/lib/hooks'
import { Transaction, User } from '@/lib/types'
import { filterTransactionsByPeriod, MONTH_NAMES, sanitizeCsvCell } from '@/lib/finance'

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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return MONTH_NAMES[now.getMonth()]
  })
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const loadingRef = useRef(false)
  const [error, setError] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadTransactions = useCallback(async (userId: string) => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true
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
      loadingRef.current = false
    }
  }, [getTransactions])

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true))
  }, [])

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

    Promise.resolve().then(() => loadTransactions(currentUser.id))
  }, [isAuthenticated, getCurrentUser, loadTransactions, router])

  const handleDeleteTransaction = async (transactionId: string) => {
    setTransactionToDelete(transactionId)
  }

  const confirmDeleteTransaction = async () => {
    if (!user || !transactionToDelete) return

    try {
      setDeleting(true)
      await deleteTransaction(transactionToDelete)
      setTransactionToDelete(null)
      await loadTransactions(user.id)
    } catch (err) {
      console.error('Erro ao deletar transação:', err)
      setError('Falha ao excluir a transação. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleAddTransaction = () => {
    router.push('/transactions/new')
  }

  const handleEditTransaction = (transactionId: string) => {
    router.push(`/transactions/${transactionId}/edit`)
  }

  const filteredTransactions = filterTransactionsByPeriod(
    transactions,
    MONTH_NAMES.indexOf(selectedMonth),
    selectedYear
  )

  if (!mounted) {
    return null
  }

  return (
    <div suppressHydrationWarning className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} selectedYear={selectedYear} onYearChange={setSelectedYear} />
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white">Transações</h1>
                  <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                    Consulte, adicione, edite ou exclua transações vinculadas ao seu perfil.
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

              {loading ? (
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-8 text-center text-slate-300">
                  Carregando transações...
                </div>
              ) : (
                <TransactionsTable
                    transactions={filteredTransactions}
                  onAddNew={handleAddTransaction}
                    onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  onExportCSV={() => {
                    const csvRows = [
                      ['Título', 'Data', 'Tipo', 'Quantidade'],
                      ...filteredTransactions.map((transaction) => [
                        sanitizeCsvCell(transaction.name),
                        new Date(transaction.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }),
                        transaction.type === 'EARNING'
                          ? 'Ganho'
                          : transaction.type === 'EXPENSE'
                          ? 'Gasto'
                          : 'Investimento',
                        transaction.amount.toFixed(2).replace('.', ','),
                      ]),
                    ]
                    const csvContent = csvRows
                      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                      .join('\n')
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `transacoes_${user?.first_name?.toLowerCase() || 'usuario'}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}
                />
              )}

              {transactionToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-transaction-title"
                    className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"
                  >
                    <h2 id="delete-transaction-title" className="text-xl font-semibold text-white">Excluir transação?</h2>
                    <p className="mt-3 text-slate-300">Esta ação não pode ser desfeita.</p>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setTransactionToDelete(null)}
                        disabled={deleting}
                        className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDeleteTransaction}
                        disabled={deleting}
                        className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      >
                        {deleting ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}
