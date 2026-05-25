'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface TransactionChartProps {
  expenses: number
  earnings: number
  investments: number
}

export function TransactionChart({
  expenses,
  earnings,
  investments,
}: TransactionChartProps) {
  const total = expenses + earnings + investments

  const data = [
    {
      name: 'Ganhos',
      value: earnings,
      percentage: total > 0 ? ((earnings / total) * 100).toFixed(0) : 0,
    },
    {
      name: 'Gastos',
      value: expenses,
      percentage: total > 0 ? ((expenses / total) * 100).toFixed(0) : 0,
    },
    {
      name: 'Investimentos',
      value: investments,
      percentage: total > 0 ? ((investments / total) * 100).toFixed(0) : 0,
    },
  ]

  const COLORS = ['#10b981', '#ef4444', '#3b82f6']

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend com percentuais */}
        <div className="mt-6 space-y-3 w-full">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
