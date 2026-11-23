import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const EMPTY_AGENDA = {
  judul: '',
  jenis: 'agenda_ojk',
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  lokasi: '',
  deskripsi: '',
  status_publik: true,
}

const EMPTY_BLOKIR = {
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  alasan: '',
  status_publik: true,
}

function formatTanggal(value) {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatJam(value) {
  return value ? String(value).slice(0, 5) : 'Seharian'
}

export default function AdminKalender() {
  const [tab, setTab] = useState('agenda')
  const [agendas, setAgendas] = useState([])
  const [blokir, setBlokir] = useState([])
  const [formAgenda, setFormAgenda] = useState(EMPTY_AGENDA)
  const [formBlokir, setFormBlokir] = useState(EMPTY_BLOKIR)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    if (!supabase) {
      setError('Supabase belum terhubung. Periksa file .env.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const [agendaResult, blokirResult] = await Promise.all([
      supabase
        .from('kalender_agenda')
        .select('*')
        .order('tanggal', { ascending: true }),
      supabase
        .from('kalender_blokir')
        .select('*')
        .order('tanggal', { ascending: true }),
    ])

    if (agendaResult.error || blokirResult.error) {
      setError(
        agendaResult.error?.message ||
          blokirResult.error?.message ||
          'Gagal mengambil data kalender.'
      )
    } else {
      setAgendas(agendaResult.data || [])
      setBlokir(blokirResult.data || [])
    }

    setLoading(false)
  }

  function updateAgenda(field, value) {
    setFormAgenda((prev) => ({ ...prev, [field]: value }))
  }

  function updateBlokir(field, value) {
    setFormBlokir((prev) => ({ ...prev, [field]: value }))
  }

  function resetAgenda() {
    setFormAgenda(EMPTY_AGENDA)
    setEditingId(null)
  }

  async function saveAgenda(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!formAgenda.judul.trim() || !formAgenda.tanggal) {
      setError('Judul dan tanggal kegiatan wajib diisi.')
      return
    }

    if (
      (formAgenda.jam_mulai && !formAgenda.jam_selesai) ||
      (!formAgenda.jam_mulai && formAgenda.jam_selesai)
    ) {
      setError('Isi kedua jam kegiatan atau kosongkan keduanya.')
      return
    }

    if (
      formAgenda.jam_mulai &&
      formAgenda.jam_selesai &&
      formAgenda.jam_mulai >= formAgenda.jam_selesai
    ) {
      setError('Jam selesai harus setelah jam mulai.')
      return
    }

    setSaving(true)

    const payload = {
      ...formAgenda,
      judul: formAgenda.judul.trim(),
      lokasi: formAgenda.lokasi.trim() || null,
      deskripsi: formAgenda.deskripsi.trim() || null,
      jam_mulai: formAgenda.jam_mulai || null,
      jam_selesai: formAgenda.jam_selesai || null,
      updated_at: new Date().toISOString(),
    }

    const result = editingId
      ? await supabase
          .from('kalender_agenda')
          .update(payload)
          .eq('id', editingId)
      : await supabase.from('kalender_agenda').insert(payload)

    setSaving(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setMessage(
      editingId ? 'Agenda berhasil diperbarui.' : 'Agenda berhasil ditambahkan.'
    )
    resetAgenda()
    await loadData()
  }

  function editAgenda(item) {
    setEditingId(item.id)
    setFormAgenda({
      judul: item.judul || '',
      jenis: item.jenis || 'agenda_ojk',
      tanggal: item.tanggal || '',
      jam_mulai: item.jam_mulai ? String(item.jam_mulai).slice(0, 5) : '',
      jam_selesai: item.jam_selesai ? String(item.jam_selesai).slice(0, 5) : '',
      lokasi: item.lokasi || '',
      deskripsi: item.deskripsi || '',
      status_publik: item.status_publik,
    })
    setTab('agenda')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteAgenda(id) {
    if (!window.confirm('Yakin ingin menghapus agenda ini?')) return

    const { error } = await supabase
      .from('kalender_agenda')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Agenda berhasil dihapus.')
    await loadData()
  }

  async function saveBlokir(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!formBlokir.tanggal || !formBlokir.alasan.trim()) {
      setError('Tanggal dan alasan wajib diisi.')
      return
    }

    if (
      (formBlokir.jam_mulai && !formBlokir.jam_selesai) ||
      (!formBlokir.jam_mulai && formBlokir.jam_selesai)
    ) {
      setError(
        'Isi kedua jam atau kosongkan keduanya untuk memblokir seharian.'
      )
      return
    }

    if (
      formBlokir.jam_mulai &&
      formBlokir.jam_selesai &&
      formBlokir.jam_mulai >= formBlokir.jam_selesai
    ) {
      setError('Jam selesai harus setelah jam mulai.')
      return
    }

    setSaving(true)

    const payload = {
      ...formBlokir,
      jam_mulai: formBlokir.jam_mulai || null,
      jam_selesai: formBlokir.jam_selesai || null,
      alasan: formBlokir.alasan.trim(),
    }

    const { error } = await supabase.from('kalender_blokir').insert(payload)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Tanggal tidak tersedia berhasil ditambahkan.')
    setFormBlokir(EMPTY_BLOKIR)
    await loadData()
  }

  async function deleteBlokir(id) {
    if (!window.confirm('Hapus penanda tanggal tidak tersedia ini?')) return

    const { error } = await supabase
      .from('kalender_blokir')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Penanda tanggal berhasil dihapus.')
    await loadData()
  }

  const inputClass =
    'w-full rounded-lg border border-[#dfe4ec] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8b1e2d]'

  const labelClass = 'mb-1.5 block text-xs font-semibold text-[#465064]'

  return (
    <div className="w-full min-w-0 bg-[#f6f7fa] p-5 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8b1e2d]">
          Manajemen Kalender
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy-950">
          Kalender Publik
        </h1>
        <p className="mt-1 text-sm text-[#647084]">
          Kelola agenda kegiatan dan ketersediaan tanggal OJK Jember.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e3e8f0] bg-white p-4">
          <p className="text-xs text-[#647084]">Total agenda</p>
          <p className="mt-1 text-2xl font-bold text-navy-950">
            {agendas.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e8f0] bg-white p-4">
          <p className="text-xs text-[#647084]">Tanggal diblokir</p>
          <p className="mt-1 text-2xl font-bold text-[#a42c3b]">
            {blokir.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e8f0] bg-white p-4">
          <p className="text-xs text-[#647084]">Agenda dipublikasikan</p>
          <p className="mt-1 text-2xl font-bold text-[#18794e]">
            {agendas.filter((item) => item.status_publik).length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('agenda')
            setError('')
            setMessage('')
          }}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
            tab === 'agenda'
              ? 'bg-navy-950 text-white'
              : 'border border-[#e3e8f0] bg-white text-navy-950'
          }`}
        >
          Agenda Kegiatan
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('blokir')
            setError('')
            setMessage('')
          }}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
            tab === 'blokir'
              ? 'bg-navy-950 text-white'
              : 'border border-[#e3e8f0] bg-white text-navy-950'
          }`}
        >
          Tanggal Tidak Tersedia
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {tab === 'agenda' && (
        <>
          <form
            onSubmit={saveAgenda}
            className="mb-7 rounded-xl border border-[#e3e8f0] bg-white p-5 md:p-6"
          >
            <h2 className="mb-5 text-base font-bold text-navy-950">
              {editingId ? 'Edit Agenda' : 'Tambah Agenda Baru'}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Nama kegiatan *</label>
                <input
                  className={inputClass}
                  value={formAgenda.judul}
                  onChange={(e) => updateAgenda('judul', e.target.value)}
                  placeholder="Contoh: Sosialisasi Literasi Keuangan"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Jenis kegiatan *</label>
                <select
                  className={inputClass}
                  value={formAgenda.jenis}
                  onChange={(e) => updateAgenda('jenis', e.target.value)}
                >
                  <option value="agenda_ojk">Agenda OJK</option>
                  <option value="visit">Visit</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Tanggal *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formAgenda.tanggal}
                  onChange={(e) => updateAgenda('tanggal', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Jam mulai</label>
                <input
                  type="time"
                  className={inputClass}
                  value={formAgenda.jam_mulai}
                  onChange={(e) => updateAgenda('jam_mulai', e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Jam selesai</label>
                <input
                  type="time"
                  className={inputClass}
                  value={formAgenda.jam_selesai}
                  onChange={(e) => updateAgenda('jam_selesai', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Lokasi kegiatan</label>
                <input
                  className={inputClass}
                  value={formAgenda.lokasi}
                  onChange={(e) => updateAgenda('lokasi', e.target.value)}
                  placeholder="Contoh: Aula Kantor OJK Jember"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Deskripsi kegiatan</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={formAgenda.deskripsi}
                  onChange={(e) => updateAgenda('deskripsi', e.target.value)}
                  placeholder="Tambahkan keterangan kegiatan..."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#465064] md:col-span-2">
                <input
                  type="checkbox"
                  checked={formAgenda.status_publik}
                  onChange={(e) =>
                    updateAgenda('status_publik', e.target.checked)
                  }
                />
                Tampilkan agenda di kalender publik
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#8b1e2d] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving
                  ? 'Menyimpan...'
                  : editingId
                    ? 'Simpan Perubahan'
                    : 'Tambah Agenda'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetAgenda}
                  className="rounded-lg border border-[#dfe4ec] px-5 py-2.5 text-sm font-semibold"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>

          <div className="rounded-xl border border-[#e3e8f0] bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-navy-950">
              Daftar Agenda
            </h2>

            {loading ? (
              <p className="text-sm text-[#647084]">Memuat agenda...</p>
            ) : agendas.length === 0 ? (
              <p className="text-sm text-[#647084]">
                Belum ada agenda yang dimasukkan.
              </p>
            ) : (
              <div className="space-y-3">
                {agendas.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-[#e8ebf0] p-4 md:flex-row md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-navy-950">
                          {item.judul}
                        </span>
                        <span className="rounded-full bg-[#f7edf0] px-2 py-1 text-[10px] font-bold text-[#8b1e2d]">
                          {item.jenis === 'agenda_ojk'
  ? 'AGENDA OJK'
  : 'VISIT'}
                        </span>
                      </div>
                      <p className="text-xs text-[#647084]">
                        {formatTanggal(item.tanggal)} ·{' '}
                        {item.jam_mulai
                          ? `${formatJam(item.jam_mulai)}–${formatJam(item.jam_selesai)} WIB`
                          : 'Sepanjang hari'}
                      </p>
                      {item.lokasi && (
                        <p className="mt-1 text-xs text-[#647084]">
                          {item.lokasi}
                        </p>
                      )}
                      <p className="mt-1 text-xs">
                        {item.status_publik
                          ? 'Dipublikasikan'
                          : 'Disembunyikan'}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => editAgenda(item)}
                        className="rounded-lg border border-[#dfe4ec] px-3 py-2 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAgenda(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'blokir' && (
        <>
          <form
            onSubmit={saveBlokir}
            className="mb-7 rounded-xl border border-[#e3e8f0] bg-white p-5 md:p-6"
          >
            <h2 className="mb-2 text-base font-bold text-navy-950">
              Tandai Tanggal Tidak Tersedia
            </h2>
            <p className="mb-5 text-xs text-[#647084]">
              Kosongkan kedua jam untuk menandai satu hari penuh tidak tersedia.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Tanggal *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formBlokir.tanggal}
                  onChange={(e) => updateBlokir('tanggal', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Alasan / keterangan *</label>
                <input
                  className={inputClass}
                  value={formBlokir.alasan}
                  onChange={(e) => updateBlokir('alasan', e.target.value)}
                  placeholder="Contoh: Jadwal kegiatan internal OJK"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Jam mulai (opsional)</label>
                <input
                  type="time"
                  className={inputClass}
                  value={formBlokir.jam_mulai}
                  onChange={(e) => updateBlokir('jam_mulai', e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Jam selesai (opsional)</label>
                <input
                  type="time"
                  className={inputClass}
                  value={formBlokir.jam_selesai}
                  onChange={(e) => updateBlokir('jam_selesai', e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#465064] md:col-span-2">
                <input
                  type="checkbox"
                  checked={formBlokir.status_publik}
                  onChange={(e) =>
                    updateBlokir('status_publik', e.target.checked)
                  }
                />
                Tampilkan informasi ini di kalender publik
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 rounded-lg bg-[#8b1e2d] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan Tanggal Tidak Tersedia'}
            </button>
          </form>

          <div className="rounded-xl border border-[#e3e8f0] bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-navy-950">
              Daftar Tanggal Tidak Tersedia
            </h2>

            {loading ? (
              <p className="text-sm text-[#647084]">Memuat data...</p>
            ) : blokir.length === 0 ? (
              <p className="text-sm text-[#647084]">
                Belum ada tanggal yang diblokir.
              </p>
            ) : (
              <div className="space-y-3">
                {blokir.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-red-100 bg-red-50/40 p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="font-semibold text-navy-950">
                        {formatTanggal(item.tanggal)}
                      </p>
                      <p className="mt-1 text-xs text-[#647084]">
                        {item.jam_mulai
                          ? `${formatJam(item.jam_mulai)}–${formatJam(item.jam_selesai)} WIB`
                          : 'Seharian penuh'}
                      </p>
                      <p className="mt-1 text-xs text-[#8b1e2d]">
                        {item.alasan}
                      </p>
                      <p className="mt-1 text-xs">
                        {item.status_publik
                          ? 'Ditampilkan ke publik'
                          : 'Disembunyikan'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBlokir(item.id)}
                      className="self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 md:self-center"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
