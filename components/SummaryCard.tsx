'use client'

import { ReactNode } from 'react'

interface SummaryCardProps {
  title: string
  amount: number
  icon: ReactNode
  bgColor: string
  iconBgColor: string
}

export function SummaryCard({
  title,
  amount,
  icon,
  bgColor,
  iconBgColor,
}: SummaryCardProps) {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)

  return (
    <div className={`${bgColor} rounded-lg p-6 flex items-center justify-between`}>
      <div>
        <p className="text-gray-400 text-sm mb-2">{title}</p>
        <p className="text-white text-2xl font-semibold">{formattedAmount}</p>
      </div>
      <div className={`${iconBgColor} rounded-full p-4 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}
