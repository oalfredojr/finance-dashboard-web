'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

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
  const total = Number(expenses) + Number(earnings) + Number(investments)

  const data = [
    {
      name: 'Ganhos',
      value: Number(earnings),
      percentage: total > 0 ? Math.round((Number(earnings) / total) * 100) : 0,
    },
    {
      name: 'Gastos',
      value: Number(expenses),
      percentage: total > 0 ? Math.round((Number(expenses) / total) * 100) : 0,
    },
    {
      name: 'Investimentos',
      value: Number(investments),
      percentage: total > 0 ? Math.round((Number(investments) / total) * 100) : 0,
    },
  ]

  const dominant = data.reduce((best, item) => (item.value > best.value ? item : best), data[0])
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
        <div>
          <h2 className="text-white text-2xl font-semibold">Distribuição</h2>
          <p className="text-sm text-slate-500 mt-1">Proporção dos seus ganhos, gastos e investimentos.</p>
        </div>

        <div className="relative h-[280px] w-full">
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={6}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total</p>
                <p className="text-3xl font-semibold text-white">{formatCurrency(total)}</p>
                <p className="text-sm text-slate-400 mt-1">{dominant.name}</p>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 text-slate-500">
              Nenhuma transação disponível ainda.
            </div>
          )}
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
