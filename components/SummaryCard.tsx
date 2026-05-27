'use client'

import { ReactNode } from 'react'

interface SummaryCardProps {
  title: string
  amount: number
  icon: ReactNode
  bgClass: string
  iconBgClass: string
  iconColorClass: string
}

export function SummaryCard({
  title,
  amount,
  icon,
  bgClass,
  iconBgClass,
  iconColorClass,
}: SummaryCardProps) {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)

  return (
    <div className={`rounded-[2rem] p-6 shadow-lg shadow-black/10 ${bgClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{formattedAmount}</p>
        </div>
        <div className={`rounded-2xl p-4 ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
