'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sidebar,
  Header,
  SummaryCard,
  TransactionsTable,
  TransactionChart,
} from '@/components'
import { useAuth, useTransactions } from '@/lib/hooks'
import { User, Transaction, DashboardSummary } from '@/lib/types'
import { DollarSign, Slash, Wallet, PiggyBank } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { getCurrentUser, isAuthenticated } = useAuth()
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
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    const now = new Date()
    return months[now.getMonth()]
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const loadingRef = useRef(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  const computeSummaryFromTransactions = useCallback((transactionsList: Transaction[]): DashboardSummary => {
    const totalEarnings = transactionsList
      .filter((item) => item.type === 'EARNING')
      .reduce((sum, item) => sum + item.amount, 0)

    const totalExpenses = transactionsList
      .filter((item) => item.type === 'EXPENSE')
      .reduce((sum, item) => sum + item.amount, 0)

    const totalInvestments = transactionsList
      .filter((item) => item.type === 'INVESTMENT')
      .reduce((sum, item) => sum + item.amount, 0)

    return {
      total_earnings: totalEarnings,
      total_expenses: totalExpenses,
      total_investments: totalInvestments,
      net_balance: totalEarnings - totalExpenses,
    }
  }, [])

  const getMonthIndex = useCallback((monthName: string) => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    return months.indexOf(monthName)
  }, [])

  const filterTransactionsByMonth = useCallback(
    (transactionsList: Transaction[], monthName: string) => {
      const monthIndex = getMonthIndex(monthName)
      return transactionsList.filter((transaction) => {
        const date = new Date(transaction.date)
        return date.getMonth() === monthIndex
      })
    },
    [getMonthIndex]
  )

  const filteredTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth, filterTransactionsByMonth]
  )

  const loadData = useCallback(async (userId: string) => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true
    try {
      setLoading(true)
      const transactionsData = await getTransactions(userId).catch((err) => {
        console.error('Erro ao carregar transações:', err)
        return []
      })

      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [getTransactions])

  const handleExportTransactions = () => {
    if (!user) return
    const rows = [
      ['Título', 'Data', 'Tipo', 'Quantidade'],
      ...filteredTransactions.map((transaction) => [
        transaction.name,
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

    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transacoes_${user.first_name.toLowerCase()}_${user.last_name.toLowerCase()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const summary = useMemo(
    () => computeSummaryFromTransactions(filteredTransactions),
    [filteredTransactions, computeSummaryFromTransactions]
  )

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

    Promise.resolve().then(() => loadData(currentUser.id))
  }, [isAuthenticated, getCurrentUser, loadData, router])

  const confirmDeleteTransaction = async () => {
    if (!user || !transactionToDelete) return

    try {
      setLoading(true)
      await deleteTransaction(transactionToDelete)
      setTransactionToDelete(null)
      await loadData(user.id)
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelDeleteTransaction = () => {
    setTransactionToDelete(null)
  }

  const handleAddTransaction = () => {
    router.push('/transactions/new')
  }

  if (!mounted) {
    return null
  }

  return (
    <div suppressHydrationWarning className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="p-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400">Carregando...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <SummaryCard
                    title="Ganhos"
                    amount={summary?.total_earnings || 0}
                    icon={
                      <DollarSign className="w-6 h-6" />
                    }
                    bgClass="bg-emerald-950"
                    iconBgClass="bg-emerald-700"
                    iconColorClass="text-emerald-200"
                  />
                  <SummaryCard
                    title="Gastos"
                    amount={summary?.total_expenses || 0}
                    icon={
                      <Slash className="w-6 h-6" />
                    }
                    bgClass="bg-rose-950"
                    iconBgClass="bg-rose-700"
                    iconColorClass="text-rose-200"
                  />
                  <SummaryCard
                    title="Saldo"
                    amount={summary?.net_balance || 0}
                    icon={
                      <Wallet className="w-6 h-6" />
                    }
                    bgClass="bg-slate-900"
                    iconBgClass="bg-slate-800"
                    iconColorClass="text-slate-200"
                  />
                  <SummaryCard
                    title="Investimentos"
                    amount={summary?.total_investments || 0}
                    icon={
                      <PiggyBank className="w-6 h-6" />
                    }
                    bgClass="bg-sky-950"
                    iconBgClass="bg-sky-700"
                    iconColorClass="text-sky-200"
                  />
                </div>

                {/* Transactions and Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Transactions Table */}
                  <div className="lg:col-span-2">
                    <TransactionsTable
                      transactions={filteredTransactions.slice(0, 5)}
                      onAddNew={handleAddTransaction}
                      onExportCSV={handleExportTransactions}
                      showActions={false}
                    />
                  </div>

                  {/* Chart */}
                  <div>
                    <TransactionChart
                      earnings={summary?.total_earnings || 0}
                      expenses={summary?.total_expenses || 0}
                      investments={summary?.total_investments || 0}
                    />
                  </div>
                </div>

                {transactionToDelete && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
                    <div className="w-full max-w-md rounded-[2rem] border border-slate-700 bg-slate-950 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                      <h2 className="text-xl font-semibold text-white">Confirmar exclusão</h2>
                      <p className="mt-3 text-slate-400">
                        Tem certeza que deseja remover esta transação? Esta ação não pode ser desfeita.
                      </p>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          onClick={cancelDeleteTransaction}
                          className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmDeleteTransaction}
                          className="rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                        >
                          Confirmar exclusão
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
