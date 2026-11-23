import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


// Mode demo: kalau .env belum diisi, aplikasi tetap jalan pakai data dummy
// (lihat src/data/dummy.js) supaya UI tetap bisa dicoba sebelum Supabase disambungkan.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
