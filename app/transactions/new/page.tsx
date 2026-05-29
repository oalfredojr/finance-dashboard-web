'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useTransactions } from '@/lib/hooks'
import { CreateTransactionRequest, User } from '@/lib/types'

const today = new Date().toISOString().slice(0, 10)

const formatBRL = (value: number | string) => {
  const number = typeof value === 'string' ? Number(value.replace(/\D+/g, '').replace(/,/, '.')) : value
  if (Number.isNaN(number)) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(number)
}

const parseBRL = (value: string) => {
  const raw = value
    .replace(/\s/g, '')
    .replace(/R\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim()

  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

export default function NewTransactionPage() {
  const router = useRouter()
  const { isAuthenticated, getCurrentUser } = useAuth()
  const { createTransaction } = useTransactions()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'EARNING' | 'EXPENSE' | 'INVESTMENT'>('EARNING')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    setUser(currentUser)
  }, [])

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const onlyNumbers = value.replace(/[^\d,\.]/g, '')
    setAmount(onlyNumbers)
  }

  const handleAmountBlur = () => {
    if (!amount) return
    const parsed = parseBRL(amount)
    if (parsed === null) return
    setAmount(formatBRL(parsed))
  }

  const handleAmountFocus = () => {
    if (!amount) return
    const parsed = parseBRL(amount)
    if (parsed !== null) {
      setAmount(parsed.toFixed(2).replace('.', ','))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !date || !amount) {
      setError('Preencha todos os campos.')
      return
    }

    if (!user) {
      setError('Usuário não encontrado.')
      return
    }

    const parsedAmount = parseBRL(amount)
    if (parsedAmount === null || parsedAmount <= 0) {
      setError('Informe um valor válido.')
      return
    }

    setLoading(true)

    const payload: CreateTransactionRequest = {
      name: name.trim(),
      date,
      amount: parsedAmount,
      type,
    }

    try {
      await createTransaction(user.id, payload)
      router.push('/transactions')
    } catch (err: any) {
      console.error('Erro ao criar transação:', err)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Não foi possível criar a transação. Tente novamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Nova transação</h1>
            <p className="mt-2 text-sm text-slate-400">
              Preencha os dados para adicionar sua movimentação financeira.
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Voltar para transações
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                placeholder="Salário, Netflix, CDB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Valor</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                onFocus={handleAmountFocus}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                placeholder="R$ 5.500,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as typeof type)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="EARNING">Receita</option>
                <option value="EXPENSE">Despesa</option>
                <option value="INVESTMENT">Investimento</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/transactions"
              className="inline-flex items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
