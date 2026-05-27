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
    <div className="bg-slate-950 rounded-[2rem] border border-slate-800 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-semibold">Distribuição</h2>
            <p className="text-sm text-slate-500 mt-1">Proporção dos seus ganhos, gastos e investimentos.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-300">
            Total: {formatCurrency(total)}
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.percentage}% do total</p>
                </div>
              </div>
              <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
