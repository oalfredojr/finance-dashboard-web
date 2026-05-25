'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, BarChart3 } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-64 bg-gray-950 min-h-screen p-6 border-r border-gray-800">
      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded grid grid-cols-2 gap-0.5">
              <div className="bg-green-400"></div>
              <div className="bg-green-400"></div>
              <div className="bg-green-400"></div>
              <div className="bg-green-400"></div>
            </div>
          </div>
          <span className="text-white font-semibold">Simple Finance</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive('/dashboard')
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <LayoutGrid size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive('/transactions')
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <BarChart3 size={20} />
          <span>Análise</span>
        </Link>
      </div>
    </div>
  )
}
