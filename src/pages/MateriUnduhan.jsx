import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

const MAX_FILE_MB = 10

export default function MateriUnduhan({ isAdmin }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('materi_unduhan')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('[materi_unduhan]', error)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      await load()
    }

    fetchData()
  }, [])
  useEffect(() => {
  if (!isSupabaseConfigured) return

  const channel = supabase
    .channel('materi-unduhan-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'materi_unduhan',
      },
      () => {
        load()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
  function handleFileChange(e) {
    const f = e.target.files?.[0]
    setError('')
    if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(
        `Ukuran file maksimal ${MAX_FILE_MB} MB. File kamu ${(f.size / 1024 / 1024).toFixed(1)} MB.`
      )
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f || null)
  }

  async function submit() {
    setError('')
    if (!form.judul || !file) {
      setError('Judul dan file wajib diisi.')
      return
    }
    setUploading(true)

    // 1. Upload file ke Supabase Storage (bucket: materi-edukasi)
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const { error: uploadErr } = await supabase.storage
      .from('materi-edukasi')
      .upload(path, file)
    if (uploadErr) {
      setError('Gagal upload file: ' + uploadErr.message)
      setUploading(false)
      return
    }

    // 2. Ambil URL publik file yang baru diupload
    const { data: publicUrlData } = supabase.storage
      .from('materi-edukasi')
      .getPublicUrl(path)

    // 3. Simpan datanya ke tabel materi_unduhan
    const { error: insertErr } = await supabase.from('materi_unduhan').insert({
      judul: form.judul,
      deskripsi: form.deskripsi,
      kategori: form.kategori,
      url_file: publicUrlData.publicUrl,
    })
    if (insertErr) {
      setError('Gagal menyimpan data: ' + insertErr.message)
      setUploading(false)
      return
    }

    setForm({ judul: '', deskripsi: '', kategori: '' })
    setFile(null)
    setShowForm(false)
    setUploading(false)
    load()
  }

  async function hapus(id) {
    if (!confirm('Hapus materi ini?')) return
    await supabase.from('materi_unduhan').delete().eq('id', id)
    load()
  }

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] text-navy-950 mb-1">Materi Edukasi</h1>
          <p className="text-sm text-[#5b6472]">
            Unduh materi edukasi keuangan resmi dari OJK Jember.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm"
          >
            {showForm ? 'Batal' : '+ Tambah Materi'}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="card mb-4">
          <h3 className="text-[15px] mb-3.5 text-navy-950">
            Tambah Materi Baru
          </h3>
          <div className="grid md:grid-cols-2 gap-3.5">
            <TextField
              label="Judul"
              value={form.judul}
              onChange={(v) => setForm({ ...form, judul: v })}
            />
            <TextField
              label="Kategori"
              value={form.kategori}
              onChange={(v) => setForm({ ...form, kategori: v })}
              placeholder="cth. Investasi"
            />
            <div className="md:col-span-2">
              m
              <TextField
                label="Deskripsi singkat"
                value={form.deskripsi}
                onChange={(v) => setForm({ ...form, deskripsi: v })}
              />
            </div>
          

            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
                Upload File (PDF/PPT/Word, maks. {MAX_FILE_MB} MB)
              </label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button
            onClick={submit}
            disabled={uploading}
            className="mt-3.5 px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm disabled:opacity-50"
          >
            {uploading ? 'Mengunggah...' : 'Simpan'}
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-[#5b6472]">Memuat data...</p>}

      {!loading && items.length === 0 && (
        <div className="card">
          <p className="text-sm text-[#5b6472]">
            Belum ada materi edukasi yang diunggah.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                {item.kategori && (
                  <span className="badge b-diproses mb-2 inline-block">
                    {item.kategori}
                  </span>
                )}
                <h4 className="font-semibold text-[15px] mb-1">{item.judul}</h4>
                {item.deskripsi && (
                  <p className="text-[13px] text-[#5b6472] mb-3">
                    {item.deskripsi}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <a
                href={item.url_file}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-semibold text-[13px]"
              >
                Unduh Materi ↓
              </a>
              {isAdmin && (
                <button
                  onClick={() => hapus(item.id)}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#e3e8f0] text-[#a3372b] font-semibold text-[13px]"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
      />
    </div>
  )
}
