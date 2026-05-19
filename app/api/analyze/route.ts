import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Lexicon sederhana Bahasa Indonesia
const POSITIVE = ['senang','bahagia','semangat','syukur','berhasil',
  'bagus','tenang','fokus','produktif','bangga','happy',
  'excited','lega','enjoy','suka','cinta','gembira']

const NEGATIVE = ['capek','lelah','sedih','cemas','takut',
  'stress','burnout','overthink','gagal','susah','sulit',
  'marah','kesal','benci','kecewa','galau','nangis']

function lexiconScore(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  POSITIVE.forEach(w => { if (lower.includes(w)) score += 0.2 })
  NEGATIVE.forEach(w => { if (lower.includes(w)) score -= 0.2 })
  return Math.max(-1, Math.min(1, score))
}

function behavioralArousal(signals: any): number {
  // IKI cepat = arousal tinggi, lambat = rendah
  const ikiScore = signals.avg_iki < 120 ? 0.6
    : signals.avg_iki < 200 ? 0.3
    : signals.avg_iki < 350 ? 0
    : -0.4
  // Banyak pause = arousal rendah
  const pausePenalty = signals.pause_count * -0.1
  return Math.max(-1, Math.min(1, ikiScore + pausePenalty))
}

function getMoodLabel(valence: number, arousal: number): string {
  if (valence > 0.4 && arousal > 0.3) return 'Semangat'
  if (valence > 0.4 && arousal <= 0.3) return 'Tenang'
  if (valence >= -0.2 && valence <= 0.4) return 'Biasa aja'
  if (valence < -0.2 && arousal > 0.2) return 'Cemas'
  return 'Lelah'
}

function getRecommendations(valence: number, arousal: number) {
  if (valence > 0.4 && arousal > 0.3) return [
    { type: 'task', title: 'Tackle task terberat sekarang', icon: '⚡', description: 'Ini window terbaikmu hari ini' },
    { type: 'music', title: 'Playlist upbeat', icon: '🎵', description: 'Pertahankan energi ini' },
  ]
  if (valence > 0.4 && arousal <= 0.3) return [
    { type: 'music', title: 'Lo-fi focus playlist', icon: '🎧', description: 'Cocok untuk mood tenangmu' },
    { type: 'task', title: 'Deep work session', icon: '💻', description: 'Kondisi ideal untuk fokus' },
  ]
  if (valence < -0.2 && arousal > 0.2) return [
    { type: 'breathing', title: 'Breathing 4-7-8', icon: '🌬️', description: 'Turunkan kecemasan dulu' },
    { type: 'rest', title: 'Jalan 10 menit', icon: '🚶', description: 'Reset pikiran sebentar' },
  ]
  return [
    { type: 'rest', title: 'Istirahat dulu', icon: '😴', description: 'Tubuhmu butuh recharge' },
    { type: 'music', title: 'Musik ambient', icon: '🎶', description: 'Temani istirahatmu' },
  ]
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, signals } = await req.json()
    const words = text.trim().split(/\s+/).filter(Boolean).length

    // Hitung mood vector lokal dulu
    let valence = lexiconScore(text)
    let arousal = behavioralArousal(signals)
    let used_gemini = false
    let insight = ''

    // Panggil Gemini hanya kalau teks > 80 kata
    if (words > 80) {
      // Inisialisasi Gemini menggunakan API key dari environment variables
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDGvcJDDULotlhBqgzdbf6eUWStaLer4H4');
      
      // Menggunakan model flash karena lebih cepat untuk task sederhana seperti JSON parsing
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: "application/json", // Memaksa AI mengeluarkan format JSON yang valid
        }
      });

      const prompt = `Analisis jurnal harian ini dan berikan output dalam format JSON dengan struktur berikut:
{"valence": float antara -1 hingga 1, "arousal": float antara -1 hingga 1, "insight": "1 kalimat insight personal dalam Bahasa Indonesia yang supportif"}

Jurnal: ${text}
Sinyal behavioral: IKI rata-rata ${signals.avg_iki}ms, backspace ratio ${signals.backspace_ratio?.toFixed(2)}`;

      try {
        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text();
        const parsed = JSON.parse(rawResponse);
        
        valence = parsed.valence;
        arousal = parsed.arousal;
        insight = parsed.insight;
        used_gemini = true;
      } catch (e) {
        console.error("Gagal melakukan parsing dari Gemini:", e);
      }
    }

    const label = getMoodLabel(valence, arousal)
    const recommendations = getRecommendations(valence, arousal)

    // Simpan ke database
    const { data: session } = await supabase
      .from('mood_sessions')
      .insert({
        user_id: user.id,
        journal_text: text,
        valence,
        arousal,
        dominance: 0.5,
        used_claude: used_gemini, // Gunakan variabel used_gemini tapi tetap simpan di kolom database yang sama agar tidak error
        word_count: words
      })
      .select()
      .single()

    // Simpan behavioral signals
    if (session) {
      await supabase.from('behavioral_signals').insert({
        session_id: session.id,
        ...signals
      })
    }

    return NextResponse.json({
      valence, arousal, label,
      insight: insight || getDefaultInsight(valence, arousal),
      recommendations,
      used_ai: used_gemini // Saya ubah key respon ini jadi lebih netral (opsional)
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menganalisis' }, { status: 500 })
  }
}

function getDefaultInsight(valence: number, arousal: number): string {
  if (valence > 0.4) return 'Tulisanmu memancarkan energi positif hari ini. Pertahankan!'
  if (valence < -0.2 && arousal > 0.2) return 'Kamu sedang dalam tekanan. Ingat, boleh kok istirahat sebentar.'
  if (valence < -0.2) return 'Hari yang berat — tapi kamu sudah melakukan hal yang benar dengan menulis.'
  return 'Hari yang biasa pun punya nilainya sendiri. Tetap jaga dirimu ya.'
}