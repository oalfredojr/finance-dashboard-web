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
    <div className="bg-gray-900 border-b border-gray-800 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* User greeting */}
        <div>
          <p className="text-gray-400 text-sm">Olá, {user?.first_name}</p>
        </div>

        {/* Center - Theme toggle and Month selector */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            {isDark ? (
              <Sun size={20} className="text-gray-400" />
            ) : (
              <Moon size={20} className="text-gray-400" />
            )}
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange?.(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Right - Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
