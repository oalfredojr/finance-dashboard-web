'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header } from '@/components'
import { useAuth, useTransactions } from '@/lib/hooks'
import { Transaction } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts'

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

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const getTypeLabel = (type: string) => {
  if (type === 'EARNING') return 'Ganho'
  if (type === 'EXPENSE') return 'Gasto'
  return 'Investimento'
}

export default function AnalisePage() {
  const router = useRouter()
  const { isAuthenticated, getCurrentUser } = useAuth()
  const { getTransactions } = useTransactions()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return months[now.getMonth()]
  })
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  const loadTransactions = useCallback(async (userId: string) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await getTransactions(userId)
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar análise:', error)
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
  }, [getCurrentUser, isAuthenticated, loadTransactions, router])

  const monthlyData = useMemo(() => {
    return months.map((monthName, index) => {
      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === index
      })
      const totalEarnings = monthTransactions
        .filter((item) => item.type === 'EARNING')
        .reduce((sum, item) => sum + item.amount, 0)
      const totalExpenses = monthTransactions
        .filter((item) => item.type === 'EXPENSE')
        .reduce((sum, item) => sum + item.amount, 0)
      const totalInvestments = monthTransactions
        .filter((item) => item.type === 'INVESTMENT')
        .reduce((sum, item) => sum + item.amount, 0)

      return {
        month: monthLabels[index],
        Ganhos: totalEarnings,
        Gastos: totalExpenses,
        Investimentos: totalInvestments,
        Saldo: totalEarnings - totalExpenses,
      }
    })
  }, [transactions])

  const selectedMonthIndex = months.indexOf(selectedMonth)
  const selectedMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.date)
        return date.getMonth() === selectedMonthIndex
      }),
    [transactions, selectedMonthIndex]
  )

  const highestExpense = useMemo(() => {
    return selectedMonthTransactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)[0]
  }, [selectedMonthTransactions])

  const highestEarning = useMemo(() => {
    return selectedMonthTransactions
      .filter((transaction) => transaction.type === 'EARNING')
      .sort((a, b) => b.amount - a.amount)[0]
  }, [selectedMonthTransactions])

  const totalsByMonth = useMemo(() => {
    const earnings = selectedMonthTransactions
      .filter((transaction) => transaction.type === 'EARNING')
      .reduce((sum, item) => sum + item.amount, 0)
    const expenses = selectedMonthTransactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((sum, item) => sum + item.amount, 0)
    return { earnings, expenses }
  }, [selectedMonthTransactions])

  const economyRate = useMemo(() => {
    if (totalsByMonth.earnings === 0) return 0
    return Math.max(0, ((totalsByMonth.earnings - totalsByMonth.expenses) / totalsByMonth.earnings) * 100)
  }, [totalsByMonth])

  const balanceEvolution = useMemo(() => {
    return monthlyData.reduce<{ month: string; balance: number }[]>((acc, month) => {
      const previousBalance = acc.length ? acc[acc.length - 1].balance : 0
      return [
        ...acc,
        {
          month: month.month,
          balance: previousBalance + month.Ganhos - month.Gastos,
        },
      ]
    }, [])
  }, [monthlyData])

  const topTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [transactions])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div suppressHydrationWarning className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          <div className="flex-1 overflow-y-auto bg-black">
            <div className="p-8 max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <p className="text-slate-300">Carregando análise...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                  <p className="text-sm text-slate-400 uppercase tracking-[0.24em]">Maior gasto do mês</p>
                  <p className="mt-4 text-xl font-semibold text-white">{highestExpense ? highestExpense.name : 'Nenhum registro'}</p>
                  <p className="mt-2 text-3xl font-semibold text-rose-400">
                    {highestExpense ? formatCurrency(highestExpense.amount) : 'R$ 0,00'}
                  </p>
                </div>
                <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                  <p className="text-sm text-slate-400 uppercase tracking-[0.24em]">Maior ganho do mês</p>
                  <p className="mt-4 text-xl font-semibold text-white">{highestEarning ? highestEarning.name : 'Nenhum registro'}</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-300">
                    {highestEarning ? formatCurrency(highestEarning.amount) : 'R$ 0,00'}
                  </p>
                </div>
                <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                  <p className="text-sm text-slate-400 uppercase tracking-[0.24em]">Taxa de economia</p>
                  <p className="mt-4 text-5xl font-semibold text-white">{Math.round(economyRate)}%</p>
                  <p className="mt-2 text-sm text-slate-500">Com base nos ganhos do mês</p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-white text-2xl font-semibold">Receita mensal</h2>
                      <p className="text-sm text-slate-500 mt-1">Ganhos, gastos e investimentos ao longo do ano.</p>
                    </div>
                  </div>
                  <div className="h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155', color: '#fff' }} />
                        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                        <Bar dataKey="Ganhos" fill="#22c55e" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="Gastos" fill="#ef4444" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="Investimentos" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                  <h2 className="text-white text-2xl font-semibold mb-4">Evolução do saldo</h2>
                  <div className="h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={balanceEvolution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155', color: '#fff' }} />
                        <Line type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white text-2xl font-semibold">Ranking de transações</h2>
                    <p className="text-sm text-slate-500 mt-1">As maiores transações do ano.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">Título</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">Tipo</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTransactions.map((transaction) => (
                        <tr key={transaction.id} className="bg-slate-900/80 backdrop-blur-sm transition hover:bg-slate-900">
                          <td className="py-4 px-4 text-white">{transaction.name}</td>
                          <td className="py-4 px-4 text-slate-400 text-sm uppercase">{getTypeLabel(transaction.type)}</td>
                          <td className="py-4 px-4 text-right text-white font-semibold">{formatCurrency(transaction.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
