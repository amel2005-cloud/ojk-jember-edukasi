import { supabase } from '../supabaseClient'
export async function getDashboardData() {}
export async function getPengajuan() {}
export async function approvePengajuan() {}
export async function updatePengajuanStatus() {}
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('v_stat_ringkasan')
    .select('*')
    .single()

  if (error) throw error

  return data
}

export async function getLatestPengajuan() {
  const { data, error } = await supabase
    .from('pengajuan')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getApprovedCalendar() {
  const { data, error } = await supabase
    .from('pengajuan')
    .select('*')
    .eq('status', 'approved')

  if (error) throw error

  return data
}
