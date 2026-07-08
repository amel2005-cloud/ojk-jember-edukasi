import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { dummyKalenderPublik } from '../data/dummy'
import Logo from '../components/Logo'

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function PublicCalendar({ onShowLogin }) {
  const [events, setEvents] = useState(dummyKalenderPublik)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) return
      const { data } = await supabase.from('v_kalender_publik').select('*').order('tanggal_final')
      if (data) setEvents(data)
    }
    load()
  }, [])

  return (
    <div className="flex-1 p-8 lg:p-10 w-full">
      <div className="flex justify-between items-center mb-5">
        <Logo size={28} />
        <button onClick={onShowLogin} className="border border-[#e3e8f0] bg-white px-4 py-2 rounded-lg text-sm font-semibold text-navy-900">
          Masuk / Ajukan Kegiatan
        </button>
      </div>

      <div className="bg-gradient-to-br from-navy-950 to-navy-700 text-white rounded-2xl p-7 mb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl mb-1.5">Kalender Edukasi Keuangan</h1>
          <p className="text-sm text-[#c7d5ea] max-w-md">
            Jadwal kegiatan edukasi keuangan yang telah disetujui di wilayah kerja Kantor OJK Jember. 
          </p>
        </div>
        <div className="text-right">
          <div className="font-serif text-3xl font-black">{events.length}</div>
          <div className="text-xs text-[#c7d5ea]">kegiatan tahun ini</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-[15px] mb-3.5 text-navy-950">Kegiatan Mendatang</h3>
        {events.map((e, i) => {
          const date = new Date(e.tanggal_final)
          return (
            <div key={i} className="flex gap-4 bg-white border border-[#e3e8f0] rounded-xl p-4 mb-2.5 items-center">
              <div className="bg-navy-950 text-white rounded-[10px] px-3.5 py-2 text-center min-w-16">
                <div className="font-serif text-xl font-black">{date.getDate()}</div>
                <div className="text-[11px] text-gold-500 uppercase font-bold">{BULAN[date.getMonth()]}</div>
              </div>
              <div>
                <h4 className="text-[15px] font-semibold mb-1">{e.nama_instansi}</h4>
                <p className="text-[13px] text-[#5b6472]">{e.materi} · {e.jam_final} WIB</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
