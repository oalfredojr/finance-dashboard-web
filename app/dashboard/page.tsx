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
import { User, Transaction } from '@/lib/types'
import { filterTransactionsByPeriod, MONTH_NAMES, sanitizeCsvCell, summarizeTransactions } from '@/lib/finance'
import { DollarSign, Slash, Wallet, PiggyBank } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { getCurrentUser, isAuthenticated } = useAuth()
  const { getTransactions } = useTransactions()

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
  const [loadError, setLoadError] = useState('')
  const [mounted, setMounted] = useState(false)
  const loadingRef = useRef(false)

  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, MONTH_NAMES.indexOf(selectedMonth), selectedYear),
    [transactions, selectedMonth, selectedYear]
  )

  const loadData = useCallback(async (userId: string) => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true
    setLoadError('')
    try {
      setLoading(true)
      const transactionsData = await getTransactions(userId)
      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setTransactions([])
      setLoadError('Não foi possível carregar os dados. Verifique a conexão e tente novamente.')
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

  const summary = useMemo(() => summarizeTransactions(filteredTransactions), [filteredTransactions])

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
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} selectedYear={selectedYear} onYearChange={setSelectedYear} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="p-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400">Carregando...</p>
              </div>
            ) : loadError ? (
              <div role="alert" className="mx-auto mt-12 max-w-xl rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-100">
                <p>{loadError}</p>
                <button
                  onClick={() => user && loadData(user.id)}
                  className="mt-4 rounded-xl bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-500"
                >
                  Tentar novamente
                </button>
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

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
