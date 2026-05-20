import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import MoodGraph from '../components/MoodGraph'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: sessions } = await supabase
    .from('mood_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(7)

  const name = profile?.display_name || user.email?.split('@')[0] || 'Kamu'
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'
  const streak = sessions?.length || 0
  const avgValence = sessions && sessions.length > 0
    ? sessions.reduce((a, b) => a + (b.valence || 0), 0) / sessions.length
    : null

  const getMoodIndicator = (valence: number | null) => {
    if (valence === null) return { emoji: '😶', from: 'from-slate-400', to: 'to-slate-500', text: 'text-slate-500', bg: 'bg-slate-100' }
    if (valence > 0.3) return { emoji: '🤩', from: 'from-emerald-400', to: 'to-teal-500', text: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (valence > 0) return { emoji: '😊', from: 'from-cyan-400', to: 'to-blue-500', text: 'text-cyan-600', bg: 'bg-cyan-100' }
    if (valence > -0.3) return { emoji: '🫠', from: 'from-amber-400', to: 'to-orange-500', text: 'text-amber-600', bg: 'bg-amber-100' }
    return { emoji: '😭', from: 'from-rose-400', to: 'to-red-500', text: 'text-rose-600', bg: 'bg-rose-100' }
  }

  const avgMood = getMoodIndicator(avgValence)

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 pb-20 font-sans relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-cyan-400/30 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-rose-400/30 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[60%] w-100 h-100 rounded-full bg-amber-300/30 blur-[100px] pointer-events-none"></div>

      {/* Floating Navbar */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <nav className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full px-6 py-3 flex justify-between items-center shadow-xl shadow-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-700 to-pink-600 tracking-tight text-lg">
              MoodLy
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm font-bold text-violet-700 bg-white/50 hover:bg-white/80 transition-all px-5 py-2.5 rounded-full shadow-sm">
              Logout
            </button>
          </form>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <p className="text-sm md:text-base font-bold text-violet-600/80 mb-2 uppercase tracking-widest">{greeting},</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            {name} <span className="inline-block animate-bounce origin-bottom-right">✨</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Tulis Jurnal CTA */}
            <Link href="/journal" className="group relative block w-full overflow-hidden rounded-4xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-pink-500 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-pink-500/40">
              <div className="px-8 py-8 flex items-center justify-between text-white relative z-10">
                <div>
                  <p className="font-black text-2xl mb-1">Tulis Jurnal</p>
                  <p className="text-sm text-pink-100 font-medium">Gimana harimu ini?</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                  <span className="text-2xl">✍️</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
            </Link>

            <Link href="/checkin" className="group relative block w-full overflow-hidden rounded-4xl bg-linear-to-br from-amber-400 via-orange-400 to-rose-400 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-orange-400/40">
              <div className="px-8 py-6 flex items-center justify-between text-white relative z-10">
                <div>
                  <p className="font-black text-xl mb-1">Check-in Cepat</p>
                  <p className="text-sm text-orange-100 font-medium">Tap emoji, selesai!</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                  <span className="text-xl">⚡</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
            </Link>

            <Link href="/playlist" className="group relative block w-full overflow-hidden rounded-4xl bg-linear-to-br from-pink-500 via-rose-500 to-red-500 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-rose-500/40">
              <div className="px-8 py-6 flex items-center justify-between text-white relative z-10">
                <div>
                  <p className="font-black text-xl mb-1">Mood Playlist</p>
                  <p className="text-sm text-rose-100 font-medium">AI pilihkan lagu untukmu</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                  <span className="text-xl">🎵</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </Link>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-linear-to-br from-orange-400 to-amber-500 rounded-4xl p-6 shadow-xl shadow-orange-500/30 flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-6xl opacity-20">🔥</div>
                <p className="text-4xl font-black mb-1 relative z-10">{streak}</p>
                <p className="text-xs font-bold text-orange-100 uppercase tracking-widest relative z-10">Jurnal</p>
              </div>

              <div className={`bg-linear-to-br ${avgMood.from} ${avgMood.to} rounded-4xl p-6 shadow-xl shadow-blue-500/20 flex flex-col justify-center items-center text-center text-white relative overflow-hidden`}>
                <div className="absolute -left-2 -bottom-4 text-6xl opacity-20">{avgMood.emoji}</div>
                <p className="text-4xl font-black mb-1 relative z-10">
                  {avgValence !== null ? (avgValence > 0 ? '+' : '') + avgValence.toFixed(1) : '—'}
                </p>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest relative z-10">Rata-rata</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {sessions && sessions.length > 1 ? (
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-xl shadow-purple-500/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-800">Tren Mood Kamu 📈</h2>
                </div>
                <div className="w-full h-12 md:h-22">
                  <MoodGraph sessions={sessions} />
                </div>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl border-2 border-dashed border-white/60 rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center h-48 shadow-lg shadow-purple-500/5">
                <span className="text-4xl mb-3">🌱</span>
                <p className="text-slate-700 font-bold">Belum cukup data nih.</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">Tulis jurnal biar grafiknya muncul!</p>
              </div>
            )}

            {/* History */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-purple-500/10 overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-white/40">
                <h2 className="text-xl font-black text-slate-800">Riwayat Terkini 🕒</h2>
              </div>

              <div className="flex-1 overflow-y-auto max-h-100 p-4">
                {sessions && sessions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {sessions.map((s: any) => {
                      const indicator = getMoodIndicator(s.valence)
                      const isCheckin = s.word_count === 0
                      return (
                        <div key={s.id} className="group flex items-center gap-5 p-4 rounded-3xl bg-white/50 hover:bg-white/80 border border-white/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-default">
                          <div className={`w-14 h-14 shrink-0 rounded-2xl ${indicator.bg} flex items-center justify-center text-2xl shadow-inner`}>
                            {indicator.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isCheckin
                              ? <p className="text-[15px] font-medium text-slate-400 italic">Quick check-in</p>
                              : <p className="text-[15px] font-medium text-slate-700 line-clamp-2 leading-relaxed">{s.journal_text}</p>
                            }
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {new Date(s.created_at).toLocaleDateString('id-ID', {
                                weekday: 'long', day: 'numeric', month: 'short'
                              })}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <span className={`text-sm font-black ${indicator.text} ${indicator.bg} px-4 py-2 rounded-xl`}>
                              {s.valence > 0 ? '+' : ''}{s.valence?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">Belum ada catatan jurnal.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}