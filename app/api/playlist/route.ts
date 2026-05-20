import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getMoodContext(valence: number, arousal: number) {
    if (valence > 0.5 && arousal > 0.5) return { mood: 'Semangat Banget', emoji: '🔥', description: 'Kamu lagi on fire — lagu untuk nemenin energimu!', color: 'from-orange-400 to-amber-500' }
    if (valence > 0.5 && arousal <= 0.5) return { mood: 'Bahagia & Santai', emoji: '🌸', description: 'Mood positif yang tenang — cocok untuk fokus.', color: 'from-emerald-400 to-teal-500' }
    if (valence >= -0.2 && arousal > 0.3) return { mood: 'Netral & Fokus', emoji: '☕', description: 'Kondisi bagus untuk productive session.', color: 'from-cyan-400 to-blue-500' }
    if (valence >= -0.2 && arousal <= 0.3) return { mood: 'Santai', emoji: '🌊', description: 'Vibes tenang — istirahat dulu yuk.', color: 'from-violet-400 to-indigo-500' }
    if (valence < -0.2 && arousal > 0.3) return { mood: 'Perlu Tenang', emoji: '🌿', description: 'Musik untuk bantu kamu slow down dan bernapas.', color: 'from-green-400 to-teal-500' }
    return { mood: 'Butuh Pelukan', emoji: '🫂', description: 'Lagu untuk nemenin kamu — kamu nggak sendirian.', color: 'from-blue-400 to-indigo-500' }
}

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { valence, arousal } = await req.json()
        const moodCtx = getMoodContext(valence, arousal)

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error("❌ ERROR: GEMINI_API_KEY belum terpasang di .env.local atau server belum di-restart!")
            return NextResponse.json({ error: 'Konfigurasi API Key Cloud bermasalah' }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
            },
        })      

        const prompt = `Kamu adalah music curator. Rekomendasikan 5 lagu yang cocok untuk seseorang dengan kondisi emosi:
- Valence: ${valence} (skala -1 negatif sampai +1 positif)
- Arousal: ${arousal} (skala -1 tenang sampai +1 energik)
- Mood: ${moodCtx.mood}

Kembalikan data dalam bentuk JSON array dengan struktur persis seperti ini:
[
  {
    "title": "judul lagu",
    "artist": "nama artis",
    "reason": "1 kalimat kenapa cocok",
    "searchQuery": "judul+artis"
  }
]

Mix lagu Indonesia dan internasional. Pilih lagu yang benar-benar ada, rilis resmi, dan populer.`

        let rawText = ""
        try {
            const result = await model.generateContent(prompt)
            rawText = result.response.text()
        } catch (geminiErr) {
            console.error("❌ ERROR SAAT MANGGIL GEMINI API:", geminiErr)
            return NextResponse.json({ error: 'Gagal berkomunikasi dengan AI' }, { status: 500 })
        }

        // Penyelamat jika Gemini nakal ngasih bungkus markdown backticks meskipun diset json murni
        const cleanedJson = rawText.replace(/```json|```/g, '').trim()

        try {
            const tracks = JSON.parse(cleanedJson)
            return NextResponse.json({ ...moodCtx, tracks })
        } catch (parseErr) {
            console.error("❌ ERROR PAS PARSING JSON. Teks mentah dari Gemini:", rawText)
            return NextResponse.json({ error: 'Format data AI tidak sesuai' }, { status: 500 })
        }

    } catch (err) {
        console.error("❌ ERROR UMUM PADA ROUTE:", err)
        return NextResponse.json({ error: 'Gagal generate playlist secara total' }, { status: 500 })
    }
}