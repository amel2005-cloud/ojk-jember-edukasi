import { supabase } from "../supabaseClient";

export async function updatePengajuan(id, payload) {
  const { error } = await supabase
    .from("pengajuan")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function insertStatusLog(data) {
  const { error } = await supabase
    .from("status_log")
    .insert(data);

  if (error) throw error;
}