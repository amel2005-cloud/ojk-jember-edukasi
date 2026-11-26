
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import Stepper from '../components/Stepper'

// Peta status ke index Stepper
const STEP_INDEX = {
  pending: 0,
  diproses: 1,
  revisi: 1,
  approved: 2,
  selesai: 3,
}

const STATUS_LABEL = {
  pending: 'Menunggu',
  diproses: 'Diproses',
  revisi: 'Perlu Revisi',
  approved: 'Disetujui',
  selesai: 'Selesai',
  rejected: 'Ditolak',
}

export default function Riwayat() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let channel = null
    let cancelled = false

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user

      if (cancelled) return

      if (!user) {
        setLoading(false)
        return
      }

      // Mengambil instansi_id berdasarkan akun yang sedang login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('instansi_id')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (profileError) {
        setErrMsg(profileError.message)
        setLoading(false)
        return
      }

      if (!profile?.instansi_id) {
        setErrMsg(
          'Akun ini belum terhubung dengan instansi. Coba daftar ulang lewat halaman Register.'
        )
        setLoading(false)
        return
      }

      // Mengambil seluruh riwayat pengajuan
      async function fetchRows() {
        const { data, error } = await supabase
          .from('pengajuan')
          .select(
            'id, nomor_urut, status, created_at, tanggal_final, jam_final, tanggal_pilihan_1, narasumber(nama), instansi(nama)'
          )
          .eq('instansi_id', profile.instansi_id)
          .order('created_at', { ascending: false })

        if (cancelled) return

        if (error) {
          setErrMsg(error.message)
        } else {
          setErrMsg('')
          setRows(data || [])
        }

        setLoading(false)
      }

      // Ambil data pertama kali
      await fetchRows()

      if (cancelled) return

      // Dengarkan perubahan status dari admin secara langsung
      channel = supabase
        .channel(`riwayat-pengajuan-${profile.instansi_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pengajuan',
            filter: `instansi_id=eq.${profile.instansi_id}`,
          },
          () => {
            fetchRows()
          }
        )
        .subscribe()
    }

    load()

    return () => {
      cancelled = true

      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">
          Riwayat Pengajuan
        </h1>
        <p className="text-sm text-[#5b6472]">
          Lihat progres pengajuan kegiatan edukasi yang sudah kamu kirim.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <p className="text-sm text-[#5b6472] card">
          Mode demo — sambungkan Supabase di .env.local untuk melihat riwayat sungguhan.
        </p>
      )}

      {isSupabaseConfigured && loading && (
        <p className="text-sm text-[#5b6472]">Memuat data...</p>
      )}

      {isSupabaseConfigured && !loading && errMsg && (
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-red-600">
            Gagal memuat riwayat: {errMsg}
          </p>
        </div>
      )}

      {isSupabaseConfigured && !loading && !errMsg && rows.length === 0 && (
        <div className="card">
          <p className="text-sm text-[#5b6472]">
            Belum ada pengajuan yang tercatat untuk instansi akun ini.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-[15px]">
                  Pengajuan #{r.nomor_urut}
                </h4>
                <p className="text-[13px] text-[#5b6472]">
                  {r.instansi?.nama ?? '-'}
                </p>
              </div>

              <span className={`badge b-${r.status}`}>
                {STATUS_LABEL[r.status] || r.status}
              </span>
            </div>

            {r.status === 'rejected' ? (
              <p className="text-[13px] text-[#a3372b] mt-2">
                Pengajuan ini belum disetujui dikarenakan jadwal yang belum
                sesuai. Silakan melakukan pengajuan ulang. Terima kasih.
              </p>
            ) : (
              <Stepper currentIndex={STEP_INDEX[r.status] ?? 0} />
            )}

            {r.status === 'approved' || r.status === 'selesai' ? (
              <p className="text-[13px] text-[#5b6472] mt-2">
                Jadwal final: <b>{r.tanggal_final || '-'}</b>{' '}
                {r.jam_final ? `pukul ${r.jam_final}` : ''}
                {r.narasumber?.nama && (
                  <>
                    {' '}· Narasumber: <b>{r.narasumber.nama}</b>
                  </>
                )}
              </p>
            ) : (
              <p className="text-[13px] text-[#5b6472] mt-2">
                Tanggal diajukan: {r.tanggal_pilihan_1 || '-'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
