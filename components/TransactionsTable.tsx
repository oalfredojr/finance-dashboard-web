'use client'

import { Transaction } from '@/lib/types'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'

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
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNING':
        return (
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        )
      case 'EXPENSE':
        return (
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        )
      case 'INVESTMENT':
        return (
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Transações</h2>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                Título
              </th>
              <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                Data
              </th>
              <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">
                Quantidade
              </th>
              <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(transaction.type)}
                    <span className="text-white">{transaction.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-400">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-4 px-4 text-right text-white">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onDelete?.(transaction.id)}
                    className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition"
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
          <p className="text-gray-400">Nenhuma transação encontrada</p>
        </div>
      )}
    </div>
  )
}
