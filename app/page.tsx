import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'

export default async function Home() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  // Kalau sudah login → dashboard, belum → login
  if (user) redirect('/dashboard')
  redirect('/login')
}