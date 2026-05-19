'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypingCollector } from '@/lib/typingCollector'

const PROMPTS = [
    'Hari ini aku merasa...',
    'Hal terbaik yang terjadi hari ini...',
    'Yang bikin aku overthinking sekarang...',
    'Aku bersyukur karena...',
    'Sesuatu yang ingin aku lepaskan hari ini...',
]

export default function JournalPage() {
    const router = useRouter()
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [sigStatus, setSigStatus] = useState('Mulai mengetik...')
    const [result, setResult] = useState<any>(null)
    const collectorRef = useRef(new TypingCollector())

    const words = text.trim().split(/\s+/).filter(Boolean).length

    function onKeydown(e: React.KeyboardEvent) {
        collectorRef.current.onKeydown(e.nativeEvent)
        const s = collectorRef.current.getSignals()

        if (words < 3) { setSigStatus('Terus menulis...'); return }
        if (s.avg_iki > 400) setSigStatus('Ketukan lambat — mikir keras nih? 🤔')
        else if (s.backspace_ratio > 0.25) setSigStatus('Banyak koreksi — tulis aja dulu, jangan diedit! ✍️')
        else if (s.pause_count > 3) setSigStatus('Banyak jeda — gapapa, pelan-pelan aja ☕')
        else setSigStatus('Alur menulis lancar ✨')
    }

    async function handleSubmit() {
        if (words < 3) return
        setLoading(true)
        const signals = collectorRef.current.getSignals()
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, signals })
        })
        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    // --- TAMPILAN HASIL ANALISIS ---
    if (result) return (
        <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 p-4 md:p-8 font-sans relative overflow-hidden flex items-center justify-center">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/30 blur-[100px] pointer-events-none"></div>

            <div className="max-w-xl w-full relative z-10">
                <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 border border-white/60 shadow-2xl shadow-purple-500/20 mb-6">
                    
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-linear-to-br from-white/80 to-white/30 border border-white/60 shadow-lg rounded-4xl flex items-center justify-center mx-auto mb-4 text-5xl">
                            {result.valence > 0.4 ? '🤩' : result.valence > 0 ? '😊' : result.valence > -0.3 ? '🫠' : '😭'}
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{result.label}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 text-center border border-white/40 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Valence</p>
                            <p className="text-2xl font-black text-slate-800">
                                {result.valence > 0 ? '+' : ''}{result.valence.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 text-center border border-white/40 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Arousal</p>
                            <p className="text-2xl font-black text-slate-800">
                                {result.arousal > 0 ? '+' : ''}{result.arousal.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-linear-to-r from-violet-500/10 to-pink-500/10 border border-white/50 rounded-3xl p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-violet-500 to-pink-500"></div>
                        <p className="text-sm font-black text-violet-700 mb-2 flex items-center gap-2">
                            <span className="text-lg">✨</span> Insight untukmu
                        </p>
                        <p className="text-[15px] font-medium text-slate-700 leading-relaxed">{result.insight}</p>
                        {result.used_claude && (
                            <p className="text-xs font-bold text-violet-500/60 mt-4 uppercase tracking-wider">AI Deep Analysis</p>
                        )}
                    </div>

                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Rekomendasi Aktivitas</p>
                    <div className="space-y-3">
                        {result.recommendations.map((r: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/50 hover:bg-white/80 border border-white/40 transition-all duration-300 rounded-2xl shadow-sm">
                                <div className="w-12 h-12 shrink-0 bg-white/60 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                                    {r.icon}
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-slate-800">{r.title}</p>
                                    <p className="text-sm font-medium text-slate-600">{r.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => router.push('/dashboard')}
                    className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-xl border-2 border-white/60 text-slate-700 font-bold py-4 rounded-4xl text-base transition-all shadow-lg shadow-purple-500/10">
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    )

    // --- TAMPILAN FORM JURNAL ---
    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 p-4 md:p-8 font-sans relative overflow-hidden">
            
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-amber-300/30 blur-[100px] pointer-events-none"></div>

            <div className="max-w-2xl mx-auto relative z-10 pt-4 md:pt-10">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/dashboard')}
                        className="w-12 h-12 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl flex items-center justify-center text-slate-700 transition-all shadow-sm">
                        <span className="text-xl font-bold">←</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Jurnal Harian</h1>
                        <p className="text-sm font-bold text-violet-600/80 uppercase tracking-widest mt-0.5">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Prompts Chips */}
                <div className="flex flex-wrap gap-2.5 mb-8">
                    {PROMPTS.map((p, i) => (
                        <button key={i} onClick={() => setText(p + ' ')}
                            className="text-sm px-5 py-2.5 bg-white/40 backdrop-blur-md border border-white/50 rounded-full text-slate-700 font-bold hover:bg-white/80 hover:scale-[1.02] hover:shadow-md transition-all">
                            {p}
                        </button>
                    ))}
                </div>

                {/* Textarea Card */}
                <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-purple-500/10 mb-6 overflow-hidden flex flex-col group focus-within:shadow-2xl focus-within:shadow-purple-500/20 transition-all duration-300">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={onKeydown}
                        placeholder="Tulis apa saja yang ada di pikiranmu... tidak ada yang salah di sini. ✨"
                        className="w-full min-h-75 p-8 text-[17px] text-slate-800 bg-transparent outline-none resize-none leading-relaxed placeholder:text-slate-400 font-medium"
                        autoFocus
                    />
                    <div className="flex justify-between items-center px-8 py-4 bg-white/30 border-t border-white/40 backdrop-blur-md">
                        <span className="text-sm font-bold text-slate-500 bg-white/50 px-3 py-1 rounded-lg">
                            {words} kata
                        </span>
                        <span className={`text-sm font-bold transition-colors ${sigStatus.includes('✨') ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {sigStatus}
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <button onClick={handleSubmit}
                    disabled={loading || words < 3}
                    className="w-full relative overflow-hidden group bg-linear-to-br from-violet-600 via-fuchsia-600 to-pink-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-pink-500/30 disabled:shadow-none rounded-4xl">
                    <div className="px-8 py-5 text-white relative z-10 flex items-center justify-center gap-2">
                        <span className="font-black text-lg">
                            {loading ? 'Sedang Menganalisis...' : 'Analisis Mood Sekarang'}
                        </span>
                        {!loading && <span className="text-xl">✨</span>}
                    </div>
                    {/* Overlay glow */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>
            </div>
        </div>
    )
}