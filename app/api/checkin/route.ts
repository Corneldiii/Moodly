import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { emoji, label, valence, arousal, note } = await req.json()

    const { error } = await supabase
      .from('mood_sessions')
      .insert({
        user_id: user.id,
        journal_text: note
          ? `${emoji} ${label} — ${note}`
          : `${emoji} ${label}`,
        valence,
        arousal,
        dominance: 0,
        used_claude: false,
        word_count: 0,   
      })

    if (error) throw error

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 })
  }
}