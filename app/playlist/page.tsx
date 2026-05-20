'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Track {
    title: string
    artist: string
    reason: string
    searchQuery: string
}

interface PlaylistResult {
    mood: string
    emoji: string
    description: string
    color: string
    tracks: Track[]
}

function getMoodPreview(valence: number, arousal: number) {
    if (valence > 0.5 && arousal > 0.5) return { mood: 'Semangat Banget', emoji: '🔥', color: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-500/40' }
    if (valence > 0.5 && arousal <= 0.5) return { mood: 'Bahagia & Santai', emoji: '🌸', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/40' }
    if (valence >= -0.2 && arousal > 0.3) return { mood: 'Netral & Fokus', emoji: '☕', color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/40' }
    if (valence >= -0.2 && arousal <= 0.3) return { mood: 'Santai', emoji: '🌊', color: 'from-violet-400 to-indigo-500', shadow: 'shadow-violet-500/40' }
    if (valence < -0.2 && arousal > 0.3) return { mood: 'Perlu Tenang', emoji: '🌿', color: 'from-green-400 to-teal-500', shadow: 'shadow-green-500/40' }
    return { mood: 'Butuh Pelukan', emoji: '🫂', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/40' }
}

export default function PlaylistPage() {
    const [valence, setValence] = useState(0.5)
    const [arousal, setArousal] = useState(0.5)
    const [result, setResult] = useState<PlaylistResult | null>(null)
    const [loading, setLoading] = useState(false)

    const preview = getMoodPreview(valence, arousal)

    async function generate() {
        setLoading(true)
        setResult(null)
        const res = await fetch('/api/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valence, arousal })
        })
        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 pb-20 relative overflow-hidden">

            {/* Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/30 blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] left-[60%] w-100 h-100 rounded-full bg-amber-300/30 blur-[100px] pointer-events-none" />

            {/* Navbar */}
            <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
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

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
                        Playlist untukmu <span className="inline-block animate-bounce">🎵</span>
                    </h1>
                    <p className="text-slate-500 font-medium">AI pilihkan lagu yang pas sama mood kamu</p>
                </div>

                {/* Sliders */}
                <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-xl shadow-purple-500/10 mb-6">

                    {/* Live mood badge */}
                    <div className={`inline-flex items-center gap-3 bg-linear-to-r ${preview.color} text-white px-5 py-2.5 rounded-full shadow-lg ${preview.shadow} mb-6 transition-all duration-300`}>
                        <span className="text-xl">{preview.emoji}</span>
                        <span className="font-black text-sm">{preview.mood}</span>
                    </div>

                    <div className="space-y-7">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-sm font-black text-slate-700">Valence — perasaan</p>
                                    <p className="text-xs text-slate-400 mt-0.5">😔 Negatif ←→ Positif 😊</p>
                                </div>
                                <span className="text-lg font-black text-slate-800 min-w-12 text-right">
                                    {valence > 0 ? '+' : ''}{valence.toFixed(1)}
                                </span>
                            </div>
                            <input
                                type="range" min="-1" max="1" step="0.1"
                                value={valence}
                                onChange={e => setValence(parseFloat(e.target.value))}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-violet-500"
                                style={{ background: `linear-gradient(to right, #93c5fd, #a78bfa, #f9a8d4)` }}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-sm font-black text-slate-700">Arousal — energi</p>
                                    <p className="text-xs text-slate-400 mt-0.5">😌 Tenang ←→ Energik ⚡</p>
                                </div>
                                <span className="text-lg font-black text-slate-800 min-w-12 text-right">
                                    {arousal > 0 ? '+' : ''}{arousal.toFixed(1)}
                                </span>
                            </div>
                            <input
                                type="range" min="-1" max="1" step="0.1"
                                value={arousal}
                                onChange={e => setArousal(parseFloat(e.target.value))}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-orange-500"
                                style={{ background: `linear-gradient(to right, #a5b4fc, #fcd34d, #fb923c)` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={generate}
                        disabled={loading}
                        className="w-full mt-7 bg-linear-to-br from-violet-600 via-fuchsia-600 to-pink-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-base transition-all shadow-2xl shadow-pink-500/40"
                    >
                        {loading ? '✨ AI lagi milih lagu...' : '🎵 Generate Playlist'}
                    </button>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/60 shadow-xl">
                        <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse mb-6" />
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 mb-4 p-3 rounded-2xl bg-white/40">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-slate-200 rounded-full animate-pulse w-3/4" />
                                    <div className="h-3 bg-slate-200 rounded-full animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {result && !loading && (
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-xl shadow-purple-500/10">

                        {/* JIKA TERJADI ERROR PADA API GEMINI */}
                        {result.error ? (
                            <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                                <span className="text-5xl mb-3 animate-bounce">⚠️</span>
                                <h3 className="text-xl font-black text-slate-800 mb-1">Gagal Memuat Playlist</h3>
                                <p className="text-sm font-medium text-slate-500 max-w-sm mb-6">{result.error}</p>
                                <button
                                    onClick={generate}
                                    className="bg-linear-to-br from-violet-600 to-pink-500 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    🔄 Coba Analisis Lagi   
                                </button>
                            </div>
                        ) : (
                            /* JIKA BERHASIL GENERATE PLAYLIST */
                            <>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">{result.emoji}</span>
                                            <h2 className="text-xl font-black text-slate-800">{result.mood}</h2>
                                        </div>
                                        <p className="text-sm text-slate-500">{result.description}</p>
                                    </div>
                                    <button
                                        onClick={generate}
                                        className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full transition-all flex-shrink-0 ml-3 cursor-pointer"
                                    >
                                        🔀 Shuffle
                                    </button>
                                </div>

                                {/* Tracks List */}
                                <div className="space-y-3">
                                    {result?.tracks?.map((track: any, i: number) => (
                                        <a
                                            key={i}
                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.searchQuery)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 hover:bg-white/90 border border-white/50 transition-all duration-200 shadow-sm hover:shadow-md group"
                                        >
                                            {/* Number badge */}
                                            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${result.color || 'from-violet-500 to-pink-500'} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                                                {i + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{track.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{track.artist}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">{track.reason}</p>
                                            </div>

                                            {/* YouTube icon */}
                                            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                <p className="text-xs text-center text-slate-400 mt-5">
                                    Klik lagu untuk langsung cari di YouTube 🎧
                                </p>
                            </>
                        )}
                    </div>
                )}  
            </main>
        </div>
    )
}