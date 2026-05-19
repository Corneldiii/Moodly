'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MOODS = [
  { emoji: '😄', label: 'Semangat',  valence: 0.9,  arousal: 0.8,  from: 'from-emerald-400', to: 'to-teal-500',    shadow: 'shadow-emerald-500/30' },
  { emoji: '😊', label: 'Senang',    valence: 0.7,  arousal: 0.4,  from: 'from-cyan-400',    to: 'to-blue-500',    shadow: 'shadow-cyan-500/30'    },
  { emoji: '😌', label: 'Tenang',    valence: 0.4,  arousal: 0.1,  from: 'from-violet-400',  to: 'to-indigo-500',  shadow: 'shadow-violet-500/30'  },
  { emoji: '😐', label: 'Biasa',     valence: 0.0,  arousal: 0.0,  from: 'from-slate-400',   to: 'to-slate-500',   shadow: 'shadow-slate-500/20'   },
  { emoji: '😔', label: 'Sedih',     valence: -0.6, arousal: -0.3, from: 'from-blue-400',    to: 'to-indigo-600',  shadow: 'shadow-blue-500/30'    },
  { emoji: '😰', label: 'Cemas',     valence: -0.5, arousal: 0.7,  from: 'from-amber-400',   to: 'to-orange-500',  shadow: 'shadow-amber-500/30'   },
  { emoji: '😤', label: 'Kesal',     valence: -0.6, arousal: 0.6,  from: 'from-orange-400',  to: 'to-red-500',     shadow: 'shadow-orange-500/30'  },
  { emoji: '😩', label: 'Lelah',     valence: -0.4, arousal: -0.7, from: 'from-rose-400',    to: 'to-pink-600',    shadow: 'shadow-rose-500/30'    },
]

export default function CheckinPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleCheckin() {
    if (selected === null) return
    setLoading(true)
    const mood = MOODS[selected]
    await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emoji: mood.emoji,
        label: mood.label,
        valence: mood.valence,
        arousal: mood.arousal,
        note: note.trim()
      })
    })
    setLoading(false)
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  // Done state
  if (done) return (
    <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/30 blur-[100px] pointer-events-none" />
      <div className="text-center relative z-10">
        <div className="text-8xl mb-6 animate-bounce">
          {selected !== null ? MOODS[selected].emoji : '✅'}
        </div>
        <p className="text-2xl font-black text-slate-800">Tercatat!</p>
        <p className="text-sm text-slate-500 mt-2 font-medium">Balik ke dashboard...</p>
      </div>
    </div>
  )

  const selectedMood = selected !== null ? MOODS[selected] : null

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 pb-20 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-100 h-100 rounded-full bg-amber-300/30 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto relative z-10">
        <nav className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full px-6 py-3 flex justify-between items-center shadow-xl shadow-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-700 to-pink-600 tracking-tight text-lg">
              moodrouter
            </span>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-violet-700 bg-white/50 hover:bg-white/80 transition-all px-5 py-2.5 rounded-full shadow-sm">
            ← Kembali
          </Link>
        </nav>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
            Lagi ngerasa apa? <span className="inline-block animate-bounce">🎯</span>
          </h1>
          <p className="text-slate-500 font-medium">Tap satu emoji — selesai dalam 5 detik</p>
        </div>

        {/* Emoji Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {MOODS.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`group relative flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-200
                ${selected === i
                  ? `border-white/80 bg-linear-to-br ${m.from} ${m.to} shadow-xl ${m.shadow} scale-105`
                  : 'border-white/50 bg-white/40 backdrop-blur-md hover:bg-white/60 hover:scale-102 hover:border-white/70'
                }`}
            >
              <span className="text-3xl md:text-4xl">{m.emoji}</span>
              <span className={`text-xs font-bold ${selected === i ? 'text-white' : 'text-slate-600'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional note — muncul setelah pilih */}
        {selected !== null && (
          <div className="bg-white/60 backdrop-blur-2xl rounded-4xl border border-white/60 shadow-xl shadow-purple-500/10 p-6 mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">
              {selectedMood?.emoji} Feeling {selectedMood?.label} — tambah catatan? <span className="text-slate-400 font-normal">(opsional)</span>
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Kenapa? Apa yang terjadi? Tulis bebas..."
              maxLength={200}
              rows={3}
              className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 resize-none placeholder:text-slate-300 font-medium"
            />
            <p className="text-xs text-slate-400 text-right mt-1">{note.length}/200</p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleCheckin}
          disabled={selected === null || loading}
          className={`w-full font-black py-5 rounded-4xl text-base transition-all duration-300 shadow-2xl
            ${selected !== null
              ? `bg-linear-to-br ${selectedMood?.from} ${selectedMood?.to} text-white ${selectedMood?.shadow} hover:scale-[1.02] active:scale-[0.98]`
              : 'bg-white/40 text-slate-400 cursor-not-allowed border-2 border-white/50'
            }`}
        >
          {loading
            ? '⏳ Menyimpan...'
            : selected !== null
              ? `Simpan — ${selectedMood?.emoji} ${selectedMood?.label}`
              : 'Pilih mood dulu ya'
          }
        </button>

      </main>
    </div>
  )
}