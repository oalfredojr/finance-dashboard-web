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
    <aside className="flex w-16 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-2 lg:w-72 lg:p-6">
      <div className="mb-6 lg:mb-10">
        <div className="mb-3 flex items-center justify-center gap-3 lg:justify-start">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-black/10">
            <div className="h-4 w-4 rounded-full bg-white/80" />
          </div>
          <div>
            <p className="hidden text-sm uppercase tracking-[0.3em] text-slate-500 lg:block">Simple Finance</p>
          </div>
        </div>
        <p className="hidden text-sm text-slate-400 lg:block">
          Acompanhe suas métricas e navegue entre análises de forma rápida.
        </p>
      </div>

      <div className="space-y-2">
        <Link
          href="/dashboard"
          aria-label="Dashboard"
          className={`group flex items-center justify-center gap-3 rounded-2xl p-2 transition lg:justify-start lg:rounded-3xl lg:px-4 lg:py-3 ${
            isActive('/dashboard')
              ? 'bg-slate-900 text-white shadow-inner shadow-black/10'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200 group-hover:bg-slate-700">
            <LayoutGrid size={20} />
          </span>
          <span className="sr-only lg:not-sr-only lg:font-medium">Dashboard</span>
        </Link>

        <Link
          href="/analise"
          aria-label="Análise"
          className={`group flex items-center justify-center gap-3 rounded-2xl p-2 transition lg:justify-start lg:rounded-3xl lg:px-4 lg:py-3 ${
            isActive('/analise')
              ? 'bg-slate-900 text-white shadow-inner shadow-black/10'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200 group-hover:bg-slate-700">
            <BarChart3 size={20} />
          </span>
          <span className="sr-only lg:not-sr-only lg:font-medium">Análise</span>
        </Link>
      </div>

      {user && (
        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 text-white lg:rounded-[2rem] lg:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white lg:h-12 lg:w-12 lg:text-lg">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
