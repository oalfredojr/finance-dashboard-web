'use client'

import { Transaction } from '@/lib/types'
import { Trash2, Plus } from 'lucide-react'

interface TransactionsTableProps {
  transactions: Transaction[]
  onAddNew?: () => void
  onDelete?: (id: string) => void
}

export function TransactionsTable({
  transactions,
  onAddNew,
  onDelete,
}: TransactionsTableProps) {
  

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNING':
        return (
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        )
      case 'EXPENSE':
        return (
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
        )
      case 'INVESTMENT':
        return (
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
        )
      default:
        return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'EARNING':
        return 'text-emerald-300'
      case 'EXPENSE':
        return 'text-rose-300'
      case 'INVESTMENT':
        return 'text-sky-300'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="bg-slate-950 rounded-[2rem] border border-slate-800 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-semibold">Transações recentes</h2>
          <p className="text-sm text-slate-500 mt-1">Veja os movimentos mais recentes da sua conta.</p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Adicionar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">
                Descrição
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">
                Data
              </th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">
                Valor
              </th>
              <th className="text-right py-3 px-4 text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="bg-slate-900/80 backdrop-blur-sm transition hover:bg-slate-900"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <p className="text-white font-medium">{transaction.name}</p>
                      <p className="text-slate-500 text-sm uppercase tracking-[0.16em]">
                        {transaction.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-400 text-sm">{formatDate(transaction.date)}</td>
                <td className={`py-4 px-4 text-right text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onDelete?.(transaction.id)}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                    title="Deletar transação"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">Nenhuma transação encontrada</p>
        </div>
      )}
    </div>
  )
}
