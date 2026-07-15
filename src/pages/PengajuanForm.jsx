import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

const MATERI_LIST = [
  'Pengelolaan Keuangan',
  'Investasi',
  'Pinjaman Online',
  'Judi Online',
  'Lembaga Jasa Keuangan',
  'Pasar Modal',
  'Asuransi',
  'Keuangan Syariah',
]

const MAX_FILE_MB = 5

export default function PengajuanForm() {
  const [instansi, setInstansi] = useState(null)
  const [loadingInstansi, setLoadingInstansi] = useState(true)
  const [form, setForm] = useState({
    tgl1: '',
    tgl2: '',
    jumlah_peserta: '',
    lokasi: '',
    tema_kegiatan: '',
    materi: ['Pengelolaan Keuangan'],
  })
  const [fileError, setFileError] = useState('')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    async function loadInstansi() {
      if (!isSupabaseConfigured) {
        setLoadingInstansi(false)
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) {
        setLoadingInstansi(false)
        return
      }
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('instansi_id, instansi(id, nama, jenis, pic_nama, pic_hp)')
        .eq('id', userId)
        .single()
      if (profileErr) console.error('[profile untuk form]', profileErr)
      if (profile?.instansi) setInstansi(profile.instansi)
      setLoadingInstansi(false)
    }
    loadInstansi()
  }, [])

  function toggleMateri(m) {
    setForm((f) => ({
      ...f,
      materi: f.materi.includes(m)
        ? f.materi.filter((x) => x !== m)
        : [...f.materi, m],
    }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setFileError('')
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(
        `Ukuran file maksimal ${MAX_FILE_MB} MB. File kamu ${(file.size / 1024 / 1024).toFixed(1)} MB.`
      )
      e.target.value = ''
    }
  }

  async function submit() {
    if (!isSupabaseConfigured) {
      setStatus('demo')
      return
    }
    if (!instansi?.id) {
      setStatus('no-instansi')
      return
    }

    const { data: pengajuanBaru, error } = await supabase
      .from('pengajuan')
      .insert({
        instansi_id: instansi.id,
        tanggal_pilihan_1: form.tgl1 || null,
        tanggal_pilihan_2: form.tgl2 || null,
        jumlah_peserta: Number(form.jumlah_peserta) || null,
        lokasi_kegiatan: form.lokasi || null,
        tema_kegiatan: form.tema_kegiatan || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[submit pengajuan]', error)
      setStatus('error')
      return
    }

    // Simpan materi yang DICENTANG SAJA (filter pakai .in), bukan semua materi di database
    if (form.materi.length > 0) {
      const { data: materiRows, error: materiErr } = await supabase
        .from('materi')
        .select('id, nama')
        .in('nama', form.materi)

      if (materiErr) {
        console.error('[materi]', materiErr)
        alert('Gagal mengambil daftar materi: ' + materiErr.message)
      } else if (!materiRows || materiRows.length === 0) {
        console.warn(
          'Tidak ada materi yang cocok ditemukan di database untuk:',
          form.materi
        )
      } else {
        const relasi = materiRows.map((m) => ({
          pengajuan_id: pengajuanBaru.id,
          materi_id: m.id,
        }))
        const { error: relasiErr } = await supabase
          .from('pengajuan_materi')
          .insert(relasi)
        if (relasiErr) {
          console.error('[pengajuan_materi]', relasiErr)
          alert('Materi gagal disimpan: ' + relasiErr.message)
        }
      }
    }

    setStatus('ok')
  }

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">
          Formulir Pengajuan Edukasi
        </h1>
        <p className="text-sm text-[#5b6472]">
          Lengkapi data di bawah, maksimal 2 alternatif tanggal pelaksanaan.
        </p>
      </div>

      {loadingInstansi && (
        <p className="text-sm text-[#5b6472]">Memuat data instansi...</p>
      )}

      {!loadingInstansi && isSupabaseConfigured && !instansi && (
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-red-600">
            Akun ini belum tertaut ke instansi manapun. Daftar ulang lewat
            halaman Register, atau hubungi admin OJK Jember.
          </p>
        </div>
      )}

      {(!isSupabaseConfigured || instansi) && (
        <div className="card">
          <h3 className="text-[15px] mb-3.5 text-navy-950">
            Data Instansi &amp; Jadwal
          </h3>

          {instansi && (
            <div className="bg-[#f7f9fc] rounded-lg p-3.5 mb-4 text-[13px] text-[#5b6472]">
              Mengajukan atas nama{' '}
              <b className="text-navy-950">{instansi.nama}</b> ({instansi.jenis}
              ) · PIC: {instansi.pic_nama || '-'} · {instansi.pic_hp || '-'}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3.5">
            <Field
              label="Alternatif Tanggal 1"
              type="date"
              value={form.tgl1}
              onChange={(v) => setForm({ ...form, tgl1: v })}
            />
            <Field
              label="Alternatif Tanggal 2"
              type="date"
              value={form.tgl2}
              onChange={(v) => setForm({ ...form, tgl2: v })}
            />
            <Field
              label="Jumlah Peserta"
              type="number"
              value={form.jumlah_peserta}
              onChange={(v) => setForm({ ...form, jumlah_peserta: v })}
              placeholder="cth. 60"
            />
            <Field
              label="Lokasi Kegiatan"
              value={form.lokasi}
              onChange={(v) => setForm({ ...form, lokasi: v })}
              placeholder="cth. Aula SMAN 2 Jember"
            />
            <div className="md:col-span-2">
              <Field
                label="Tema Kegiatan"
                value={form.tema_kegiatan}
                onChange={(v) => setForm({ ...form, tema_kegiatan: v })}
                placeholder="cth. Perlindungan Konsumen Sektor Jasa Keuangan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
                Materi Edukasi (boleh pilih lebih dari satu)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {MATERI_LIST.map((m) => (
                  <label
                    key={m}
                    className="flex gap-1.5 items-center text-[13px]"
                  >
                    <input
                      type="checkbox"
                      checked={form.materi.includes(m)}
                      onChange={() => toggleMateri(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
                Surat Permohonan (PDF, maks. {MAX_FILE_MB} MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                className="text-sm"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-xs text-red-600 mt-1.5">{fileError}</p>
              )}
            </div>
          </div>
          <button
            onClick={submit}
            className="mt-4 px-5 py-3 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm"
          >
            Kirim Pengajuan
          </button>
          {status === 'ok' && (
            <p className="text-sm text-green-700 mt-3">
              Pengajuan berhasil dikirim.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 mt-3">
              Gagal mengirim, coba lagi.
            </p>
          )}
          {status === 'no-instansi' && (
            <p className="text-sm text-red-600 mt-3">
              Instansi belum tertaut ke akun ini.
            </p>
          )}
          {status === 'demo' && (
            <p className="text-sm text-[#5b6472] mt-3">
              Mode demo — isi .env.local untuk mengirim ke Supabase sungguhan.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
      />
    </div>
  )
}
