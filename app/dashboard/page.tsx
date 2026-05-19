import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createServerSupabase()

    // Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Ambil profile dari tabel profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Ambil 7 sesi terakhir
    const { data: sessions } = await supabase
        .from('mood_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)

    const name = profile?.display_name || user.email?.split('@')[0] || 'Kamu'
    const sessionCount = sessions?.length || 0

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto px-4 py-8">

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500" />
                        <span className="font-medium text-gray-900">moodly</span>
                    </div>
                    <form action="/api/auth/logout" method="POST">
                        <button className="text-xs text-gray-400 hover:text-gray-600">Logout</button>
                    </form>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-1">Hai,</p>
                    <h1 className="text-2xl font-medium text-gray-900">{name} 👋</h1>
                </div>

                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-4">
                    <p className="text-sm text-violet-600 font-medium mb-1">
                        {sessionCount === 0
                            ? 'Belum ada jurnal nih'
                            : `${sessionCount} jurnal tercatat`}
                    </p>
                    <p className="text-xs text-violet-400">
                        {sessionCount === 0
                            ? 'Yuk mulai jurnal pertamamu hari ini!'
                            : 'Terus semangat journaling ya!'}
                    </p>
                </div>

                <a
                    href="/journal"
                    className="block w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-4 rounded-2xl text-center text-sm transition-all"
                >
                    ✍️ Tulis jurnal sekarang
                </a>

                {sessions && sessions.length > 0 && (
                    <div className="mt-6">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                            Jurnal terakhir
                        </p>
                        <div className="space-y-2">
                            {sessions.map((s: any) => (
                                <div key={s.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-700 line-clamp-1">
                                            {s.journal_text?.slice(0, 50)}...
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(s.created_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <span className={s.valence > 0 ? 'text-sm font-medium text-green-500' : 'text-sm font-medium text-red-400'}>
                                        {s.valence > 0 ? '+' : ''}{s.valence?.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}