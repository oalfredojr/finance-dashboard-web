'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks'
import { User } from '@/lib/types'

interface HeaderProps {
  selectedMonth?: string
  onMonthChange?: (month: string) => void
}

export function Header({ selectedMonth = 'Janeiro', onMonthChange }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isDark, setIsDark] = useState(true)
  const { logout, getCurrentUser } = useAuth()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    logout()
  }

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

  return (
    <div className="bg-slate-950 border-b border-slate-800 px-8 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Visão geral</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Olá, {user?.first_name}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Aqui está seu resumo financeiro do mês atual. Acompanhe ganhos, gastos e investimentos em um só lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange?.(e.target.value)}
            className="min-w-[180px] bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="rounded-2xl bg-slate-900 p-3 text-slate-300 hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
