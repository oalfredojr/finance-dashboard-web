'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/hooks'

export function Sidebar() {
  const pathname = usePathname()
  const { getCurrentUser } = useAuth()
  const user = typeof window !== 'undefined' ? getCurrentUser() : null

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`)

  return (
    <div className="w-72 bg-slate-950 min-h-screen p-6 border-r border-slate-800">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-black/10">
            <div className="h-4 w-4 rounded-full bg-white/80" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Simple Finance</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Acompanhe suas métricas e navegue entre análises de forma rápida.
        </p>
      </div>

      <div className="space-y-2">
        <Link
          href="/dashboard"
          className={`group flex items-center gap-3 rounded-3xl px-4 py-3 transition ${
            isActive('/dashboard')
              ? 'bg-slate-900 text-white shadow-inner shadow-black/10'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200 group-hover:bg-slate-700">
            <LayoutGrid size={20} />
          </span>
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/analise"
          className={`group flex items-center gap-3 rounded-3xl px-4 py-3 transition ${
            isActive('/analise')
              ? 'bg-slate-900 text-white shadow-inner shadow-black/10'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200 group-hover:bg-slate-700">
            <BarChart3 size={20} />
          </span>
          <span className="font-medium">Análise</span>
        </Link>
      </div>

      {user && (
        <div className="mt-auto rounded-[2rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
