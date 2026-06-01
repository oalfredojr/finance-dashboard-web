'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
    if (!firstName || !lastName || !email || !password) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      })
      router.push('/login')
    } catch (error) {
      const errObj = error as { response?: { data?: { message?: string } } } | undefined
      const message = errObj?.response?.data?.message || (error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded grid grid-cols-2 gap-0.5">
                <div className="bg-green-400"></div>
                <div className="bg-green-400"></div>
                <div className="bg-green-400"></div>
                <div className="bg-green-400"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Simple Finance</h1>
          </div>
          <p className="text-gray-400">Crie sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* First Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primeiro Nome
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="João"
              />
            </div>
          </div>

          {/* Last Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sobrenome
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="Silva"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-green-500 hover:text-green-400">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
