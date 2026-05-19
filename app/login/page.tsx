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
    <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Blobs untuk efek Vibrant */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/40 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/40 blur-[100px] pointer-events-none"></div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-2xl shadow-purple-500/20 relative z-10">

        {/* Logo */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <span className="text-white font-black text-2xl">M</span>
          </div>
          <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-700 to-pink-600 tracking-tight text-2xl">
            moodrouter
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 mb-2">Selamat datang kembali ✨</h1>
          <p className="text-sm font-bold text-slate-500">Masuk untuk lanjut journaling</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 font-bold text-sm rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-xs font-black text-slate-500 mb-2 block uppercase tracking-widest ml-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl px-5 py-4 text-[15px] text-slate-800 font-medium outline-none focus:bg-white/80 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 mb-2 block uppercase tracking-widest ml-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl px-5 py-4 text-[15px] text-slate-800 font-medium outline-none focus:bg-white/80 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full mt-8 relative overflow-hidden group bg-linear-to-br from-violet-600 via-fuchsia-600 to-pink-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-pink-500/30 disabled:shadow-none rounded-3xl"
        >
          <div className="px-8 py-4 text-white relative z-10 flex items-center justify-center">
            <span className="font-black text-[17px]">
              {loading ? 'Sedang Masuk...' : 'Masuk Sekarang'}
            </span>
          </div>
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
        </button>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Belum punya akun?{' '}
          <Link href="/register" className="text-violet-600 font-black hover:text-pink-600 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}