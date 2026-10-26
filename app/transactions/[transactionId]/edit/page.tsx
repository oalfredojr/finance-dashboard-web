'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useTransactions } from '@/lib/hooks'
import { Transaction } from '@/lib/types'

export default function EditTransactionPage() {
  const router = useRouter()
  const { transactionId } = useParams<{ transactionId: string }>()
  const { isAuthenticated, getCurrentUser } = useAuth()
  const { getTransactions, updateTransaction } = useTransactions()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<Transaction['type']>('EARNING')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.replace('/login')
      return
    }

    getTransactions(currentUser.id)
      .then((items: Transaction[]) => {
        const found = items.find((item) => item.id === transactionId)
        if (!found) {
          setError('Transação não encontrada.')
          return
        }
        setTransaction(found)
        setName(found.name)
        setDate(found.date.slice(0, 10))
        setAmount(String(found.amount))
        setType(found.type)
      })
      .catch(() => setError('Não foi possível carregar a transação.'))
      .finally(() => setLoading(false))
  }, [getCurrentUser, getTransactions, isAuthenticated, router, transactionId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const parsedAmount = Number(amount)
    if (!transaction || !name.trim() || !date || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Informe descrição, data e um valor maior que zero.')
      return
    }

    setSaving(true)
    try {
      await updateTransaction(transaction.id, {
        name: name.trim(),
        date,
        amount: parsedAmount,
        type,
      })
      router.push('/transactions')
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })
        .response?.data?.message
      setError(message || 'Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-950 text-slate-300">Carregando transação...</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Editar transação</h1>
          <Link href="/transactions" className="text-sm text-slate-300 hover:text-white">Voltar</Link>
        </div>

        {error && <p role="alert" className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}

        {transaction && (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label htmlFor="edit-name" className="mb-2 block text-sm text-slate-300">Descrição</label>
              <input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3" />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="edit-date" className="mb-2 block text-sm text-slate-300">Data</label>
                <input id="edit-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3" />
              </div>
              <div>
                <label htmlFor="edit-amount" className="mb-2 block text-sm text-slate-300">Valor</label>
                <input id="edit-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3" />
              </div>
              <div>
                <label htmlFor="edit-type" className="mb-2 block text-sm text-slate-300">Tipo</label>
                <select id="edit-type" value={type} onChange={(event) => setType(event.target.value as Transaction['type'])} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
                  <option value="EARNING">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INVESTMENT">Investimento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}