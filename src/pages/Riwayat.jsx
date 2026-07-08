import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import Stepper from '../components/Stepper'

// Peta status ke index Stepper (Diterima -> Diverifikasi -> Approved -> Selesai)
const STEP_INDEX = { pending: 0, diproses: 1, revisi: 1, approved: 2, selesai: 3 }

export default function Riwayat() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) {
        setLoading(false)
        return
      }

      // PENTING: penautan akun -> instansi disimpan di profiles.instansi_id,
      // BUKAN di kolom instansi.user_id (tabel instansi tidak punya kolom itu).
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('instansi_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setErrMsg(profileError.message)
        setLoading(false)
        return
      }
      if (!profile?.instansi_id) {
        setErrMsg('Akun ini belum terhubung dengan instansi. Coba daftar ulang lewat halaman Register.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('pengajuan')
        .select(
          'id, nomor_urut, status, created_at, tanggal_final, jam_final, tanggal_pilihan_1, narasumber(nama), instansi(nama)'
        )
        .eq('instansi_id', profile.instansi_id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrMsg(error.message)
      } else {
        setRows(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">Riwayat Pengajuan</h1>
        <p className="text-sm text-[#5b6472]">Lihat progres pengajuan kegiatan edukasi yang sudah kamu kirim.</p>
      </div>

      {!isSupabaseConfigured && (
        <p className="text-sm text-[#5b6472] card">Mode demo — sambungkan Supabase di .env.local untuk melihat riwayat sungguhan.</p>
      )}

      {isSupabaseConfigured && loading && <p className="text-sm text-[#5b6472]">Memuat data...</p>}

      {isSupabaseConfigured && !loading && errMsg && (
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-red-600">Gagal memuat riwayat: {errMsg}</p>
        </div>
      )}

      {isSupabaseConfigured && !loading && !errMsg && rows.length === 0 && (
        <div className="card">
          <p className="text-sm text-[#5b6472]">Belum ada pengajuan yang tercatat untuk instansi akun ini.</p>
        </div>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-[15px]">Pengajuan #{r.nomor_urut}</h4>
                <p className="text-[13px] text-[#5b6472]">{r.instansi?.nama ?? '-'}</p>
              </div>
              <span className={`badge b-${r.status}`}>{r.status}</span>
            </div>

            {r.status === 'rejected' ? (
              <p className="text-[13px] text-[#a3372b] mt-2">Pengajuan ini belum disetujui dikarenakan jadwal yang belum sesuai. Silahkan melakukan pengajuan ulang. Terima kasih</p>
            ) : (
              <Stepper currentIndex={STEP_INDEX[r.status] ?? 0} />
            )}

            {r.status === 'approved' || r.status === 'selesai' ? (
              <p className="text-[13px] text-[#5b6472] mt-2">
                Jadwal final: <b>{r.tanggal_final}</b> {r.jam_final ? `pukul ${r.jam_final}` : ''}
                {r.narasumber?.nama && <> · Narasumber: <b>{r.narasumber.nama}</b></>}
              </p>
            ) : (
              <p className="text-[13px] text-[#5b6472] mt-2">Tanggal diajukan: {r.tanggal_pilihan_1}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
