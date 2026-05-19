// Buat file ini untuk test koneksi DB
// Akses: http://localhost:3000/api/test
// Hapus file ini setelah berhasil!

import { createServerSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabase()

  // Coba query tabel profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('count')

  if (error) {
    return NextResponse.json({
      status: '❌ error',
      message: error.message
    }, { status: 500 })
  }

  return NextResponse.json({
    status: '✅ connected!',
    message: 'Supabase terhubung dengan sempurna',
    data
  })
}