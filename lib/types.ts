// Semua TypeScript types untuk MoodRouter

export interface MoodSession {
  id: string
  user_id: string
  journal_text: string
  valence: number    // -1 sampai +1
  arousal: number    // -1 sampai +1
  dominance: number  // -1 sampai +1
  used_claude: boolean
  word_count: number
  created_at: string
}

export interface BehavioralSignals {
  avg_iki: number          // rata-rata ms antar keystrokes
  backspace_ratio: number  // 0-1, makin tinggi makin banyak hapus
  pause_count: number      // jeda >3 detik
  session_duration: number // detik
  burst_count: number      // berapa kali berhenti-mulai lagi
}

export interface MoodVector {
  valence: number
  arousal: number
  dominance: number
  label: string           // "Baik", "Cemas", "Lelah", dst
  used_claude: boolean
  flags: string[]
}

export interface Recommendation {
  type: 'activity' | 'music' | 'rest' | 'task' | 'breathing'
  title: string
  description: string
  icon: string
}

export interface AnalyzePayload {
  text: string
  signals: BehavioralSignals
}