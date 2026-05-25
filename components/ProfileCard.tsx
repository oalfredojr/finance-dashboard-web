'use client'

import { User } from '@/lib/types'
import { Mail } from 'lucide-react'

interface ProfileCardProps {
  user: User | null
}

export function ProfileCard({ user }: ProfileCardProps) {
  if (!user) return null

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
        </div>
        <div>
          <p className="text-white font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
            <Mail size={14} />
            {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
