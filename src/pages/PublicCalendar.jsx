import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import Logo from '../components/Logo'

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTanggal(value) {
  if (!value) return '-'

  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatJam(value) {
  return value ? String(value).slice(0, 5) + ' WIB' : 'Sepanjang hari'
}

export default function PublicCalendar({ onShowLogin }) {
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState(getDateKey(today))
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCalendar() {
      if (!isSupabaseConfigured || !supabase) {
        setError('Kalender belum terhubung ke Supabase.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const [pengajuanResult, agendaResult, blokirResult] = await Promise.all([
        supabase.from('v_kalender_publik').select('*').order('tanggal_final'),

        supabase
          .from('kalender_agenda')
          .select('*')
          .eq('status_publik', true)
          .order('tanggal'),

        supabase
          .from('kalender_blokir')
          .select('*')
          .eq('status_publik', true)
          .order('tanggal'),
      ])

      const errors = [
        pengajuanResult.error,
        agendaResult.error,
        blokirResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        setError(errors.map((item) => item.message).join(' | '))
      }

      const pengajuan = (pengajuanResult.data || []).map((item) => ({
        id: `pengajuan-${item.id}`,
        tanggal: item.tanggal_final,
        judul: item.nama_instansi,
        jenis: 'pengajuan',
        kategori: 'Pengajuan Disetujui',
        jam: item.jam_final,
        lokasi: item.lokasi_kegiatan,
        deskripsi: item.materi,
      }))

      const agenda = (agendaResult.data || []).map((item) => ({
        id: `agenda-${item.id}`,
        tanggal: item.tanggal,
        judul: item.judul,
        jenis: item.jenis,
        kategori: item.jenis === 'agenda_ojk' ? 'Agenda OJK' : 'Visit',
        jam: item.jam_mulai,
        jamSelesai: item.jam_selesai,
        lokasi: item.lokasi,
        deskripsi: item.deskripsi,
      }))

      const tanggalBlokir = (blokirResult.data || []).map((item) => ({
        id: `blokir-${item.id}`,
        tanggal: item.tanggal,
        judul: 'Tanggal Tidak Tersedia',
        jenis: 'blokir',
        kategori: 'Tidak Tersedia',
        jam: item.jam_mulai,
        jamSelesai: item.jam_selesai,
        deskripsi: item.alasan,
      }))

      const semuaData = [...pengajuan, ...agenda, ...tanggalBlokir]
        .filter((item) => item.tanggal)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))

      setEvents(semuaData)
      setLoading(false)
    }

    loadCalendar()
  }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = new Date(year, month + 1, 0).getDate()

  const calendarDays = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  const eventsByDate = events.reduce((result, item) => {
    if (!result[item.tanggal]) result[item.tanggal] = []
    result[item.tanggal].push(item)
    return result
  }, {})

  const selectedEvents = eventsByDate[selectedDate] || []

  const monthName = currentMonth.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  function changeMonth(amount) {
    setCurrentMonth(new Date(year, month + amount, 1))
  }

  return (
    <div className="min-h-screen w-full bg-[#f6f7fa] p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Logo size={28} />

          <button
            onClick={onShowLogin}
            className="rounded-lg border border-[#e3e8f0] bg-white px-4 py-2 text-sm font-semibold text-navy-900"
          >
            Masuk / Ajukan Kegiatan
          </button>
        </div>

        <div
          className="mb-6 flex flex-col justify-between gap-5 rounded-2xl bg-cover bg-center p-6 text-white md:flex-row md:items-center md:p-8"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(72,12,23,0.94), rgba(139,30,45,0.85)), url('/images/login-bg.jpg')",
          }}
        >
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e6c477]">
              OJK Jember
            </p>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">
              Kalender Kegiatan
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-[#e7dce0]">
              Informasi jadwal edukasi keuangan, agenda OJK, kunjungan, dan
              ketersediaan tanggal kegiatan.
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 px-6 py-4 md:min-w-36 md:text-center">
            <p className="text-3xl font-black">{events.length}</p>
            <p className="text-xs text-[#e7dce0]">Informasi kalender</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-[#e3e8f0] bg-white p-4 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8b1e2d]">
                  Jadwal kegiatan
                </p>
                <h2 className="mt-1 text-xl font-bold capitalize text-navy-950">
                  {monthName}
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3e8f0] text-lg hover:bg-gray-50"
                  aria-label="Bulan sebelumnya"
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(
                      new Date(today.getFullYear(), today.getMonth(), 1)
                    )
                    setSelectedDate(getDateKey(today))
                  }}
                  className="rounded-lg border border-[#e3e8f0] px-3 text-xs font-semibold text-navy-950 hover:bg-gray-50"
                >
                  Hari ini
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3e8f0] text-lg hover:bg-gray-50"
                  aria-label="Bulan berikutnya"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-[#e9edf2] pb-2">
              {HARI.map((hari) => (
                <div
                  key={hari}
                  className="py-2 text-center text-[10px] font-bold uppercase text-[#8490a1] md:text-xs"
                >
                  {hari}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-20 border-b border-[#edf0f4] md:min-h-28"
                    />
                  )
                }

                const dateKey = getDateKey(new Date(year, month, day))
                const dayEvents = eventsByDate[dateKey] || []
                const isSelected = selectedDate === dateKey
                const isToday = dateKey === getDateKey(today)

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`min-w-0 min-h-20 border-b border-[#edf0f4] p-1 text-left transition hover:bg-[#faf7f7] md:min-h-28 md:p-2 ${
                      isSelected
                        ? 'bg-[#f9eff1] ring-1 ring-inset ring-[#8b1e2d]'
                        : ''
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold md:text-sm ${
                        isToday
                          ? 'bg-[#8b1e2d] text-white'
                          : isSelected
                            ? 'text-[#8b1e2d]'
                            : 'text-navy-950'
                      }`}
                    >
                      {day}
                    </span>

                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className={`truncate rounded px-1 py-1 text-[8px] font-semibold md:text-[10px] ${
                            item.jenis === 'blokir'
                              ? 'bg-red-100 text-red-700'
                              : item.jenis === 'visit' ||
                                  item.jenis === 'kunjungan_masyarakat'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-[#f5e8eb] text-[#8b1e2d]'
                          }`}
                        >
                          {item.jenis === 'blokir'
                            ? 'Tidak tersedia'
                            : item.judul}
                        </div>
                      ))}

                      {dayEvents.length > 2 && (
                        <p className="text-[9px] text-[#647084]">
                          +{dayEvents.length - 2} lainnya
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#647084] md:text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#8b1e2d]" />
                Agenda OJK / Pengajuan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                Visit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
                Tidak tersedia
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e3e8f0] bg-white p-5 shadow-sm md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b1e2d]">
              Detail tanggal
            </p>
            <h2 className="mb-5 mt-1 text-lg font-bold capitalize text-navy-950">
              {formatTanggal(selectedDate)}
            </h2>

            {loading ? (
              <p className="text-sm text-[#647084]">Memuat kalender...</p>
            ) : selectedEvents.length === 0 ? (
              <div className="rounded-xl bg-[#f6f7fa] p-5 text-center">
                <p className="text-sm font-semibold text-navy-950">
                  Belum ada informasi kegiatan
                </p>
                <p className="mt-1 text-xs text-[#647084]">
                  Tidak ada agenda atau penanda tanggal tidak tersedia pada
                  tanggal ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 ${
                      item.jenis === 'blokir'
                        ? 'border-red-200 bg-red-50/60'
                        : 'border-[#e8ebf0] bg-white'
                    }`}
                  >
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        item.jenis === 'blokir'
                          ? 'bg-red-100 text-red-700'
                          : item.jenis === 'visit' ||
                              item.jenis === 'kunjungan_masyarakat'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-[#f7edf0] text-[#8b1e2d]'
                      }`}
                    >
                      {item.kategori}
                    </span>

                    <h3 className="mt-2 text-sm font-bold text-navy-950">
                      {item.judul}
                    </h3>

                    {item.jenis !== 'blokir' && (
                      <p className="mt-2 text-xs text-[#647084]">
                        {item.jam
                          ? `${formatJam(item.jam)}${item.jamSelesai ? ` – ${formatJam(item.jamSelesai)}` : ''}`
                          : 'Sepanjang hari'}
                      </p>
                    )}

                    {item.jenis === 'blokir' && (
                      <p className="mt-2 text-xs font-medium text-red-700">
                        {item.jam
                          ? `${formatJam(item.jam)}${item.jamSelesai ? ` – ${formatJam(item.jamSelesai)}` : ''}`
                          : 'Tidak tersedia sepanjang hari'}
                      </p>
                    )}

                    {item.lokasi && (
                      <p className="mt-2 text-xs text-[#647084]">
                        Lokasi: {item.lokasi}
                      </p>
                    )}

                    {item.deskripsi && (
                      <p className="mt-2 text-xs leading-relaxed text-[#647084]">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-[#8a94a3]">
          Informasi kalender kegiatan OJK Jember
        </p>
      </div>
    </div>
  )
}
