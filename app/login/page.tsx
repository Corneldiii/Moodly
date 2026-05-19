'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm border border-gray-100">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="font-medium text-gray-900">moodly</span>
        </div>

        <h1 className="text-xl font-medium text-gray-900 mb-1">Selamat datang kembali</h1>
        <p className="text-sm text-gray-500 mb-6">Masuk untuk lanjut journaling</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full mt-5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-all"
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Belum punya akun?{' '}
          <Link href="/register" className="text-violet-500 font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}