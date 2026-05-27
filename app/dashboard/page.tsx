'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sidebar,
  Header,
  SummaryCard,
  TransactionsTable,
  TransactionChart,
  ProfileCard,
} from '@/components'
import { useAuth, useTransactions, useDashboard } from '@/lib/hooks'
import { User, Transaction, DashboardSummary } from '@/lib/types'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { getCurrentUser, isAuthenticated } = useAuth()
  const { getTransactions } = useTransactions()
  const { getDashboardSummary } = useDashboard()

  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('Janeiro')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificar autenticação
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
    loadData(currentUser.id)
  }, [])

  const loadData = async (userId: string) => {
    try {
      setLoading(true)
      const [transactionsData, summaryData] = await Promise.all([
        getTransactions(userId).catch((err) => {
          console.error('Erro ao carregar transações:', err)
          return []
        }),
        getDashboardSummary(userId).catch((err) => {
          console.error('Erro ao carregar resumo:', err)
          return null
        }),
      ])

      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
      setSummary(summaryData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    // TODO: Implementar delete
    console.log('Deletar transação:', transactionId)
  }

  const handleAddTransaction = () => {
    router.push('/transactions/new')
  }

  if (!mounted || !isAuthenticated()) {
    return null
  }

  return (
    <div className="flex h-screen">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <SummaryCard
                    title="Ganhos"
                    amount={summary?.total_earnings || 0}
                    icon={
                      <TrendingUp className="w-6 h-6" />
                    }
                    bgClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                    iconBgClass="bg-white/10"
                    iconColorClass="text-emerald-100"
                  />
                  <SummaryCard
                    title="Gastos"
                    amount={summary?.total_expenses || 0}
                    icon={
                      <TrendingDown className="w-6 h-6" />
                    }
                    bgClass="bg-gradient-to-br from-rose-500 to-red-600"
                    iconBgClass="bg-white/10"
                    iconColorClass="text-rose-100"
                  />
                  <SummaryCard
                    title="Saldo"
                    amount={summary?.net_balance || 0}
                    icon={
                      <Wallet className="w-6 h-6" />
                    }
                    bgClass="bg-gradient-to-br from-slate-800 to-slate-900"
                    iconBgClass="bg-white/10"
                    iconColorClass="text-slate-200"
                  />
                  <SummaryCard
                    title="Investimentos"
                    amount={summary?.total_investments || 0}
                    icon={
                      <PiggyBank className="w-6 h-6" />
                    }
                    bgClass="bg-gradient-to-br from-sky-500 to-blue-600"
                    iconBgClass="bg-white/10"
                    iconColorClass="text-sky-100"
                  />
                </div>

                {/* Transactions and Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Transactions Table */}
                  <div className="lg:col-span-2">
                    <TransactionsTable
                      transactions={transactions}
                      onAddNew={handleAddTransaction}
                      onDelete={handleDeleteTransaction}
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

                {/* Profile Card */}
                <ProfileCard user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
