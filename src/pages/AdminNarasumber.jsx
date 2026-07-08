import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

export default function AdminNarasumber() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', bidang_keahlian: '', kontak: '' })
  const [error, setError] = useState('')

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('narasumber').select('*').order('nama')
    if (error) console.error('[narasumber]', error)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
  const init = async () => {
    await load()
  }

  init()
}, [])

  async function submit() {
    setError('')
    if (!form.nama) {
      setError('Nama narasumber wajib diisi.')
      return
    }
    const { error: err } = await supabase.from('narasumber').insert(form)
    if (err) {
      setError(err.message)
      return
    }
    setForm({ nama: '', bidang_keahlian: '', kontak: '' })
    setShowForm(false)
    load()
  }

  async function hapus(id) {
    if (!confirm('Hapus narasumber ini?')) return
    await supabase.from('narasumber').delete().eq('id', id)
    load()
  }

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] text-navy-950 mb-1">Manajemen Narasumber</h1>
          <p className="text-sm text-[#5b6472]">Kelola daftar narasumber untuk kegiatan edukasi keuangan.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm"
        >
          {showForm ? 'Batal' : '+ Tambah Narasumber'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="text-[15px] mb-3.5 text-navy-950">Narasumber Baru</h3>
          <div className="grid md:grid-cols-3 gap-3.5">
            <TextField label="Nama" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} />
            <TextField label="Bidang Keahlian" value={form.bidang_keahlian} onChange={(v) => setForm({ ...form, bidang_keahlian: v })} placeholder="cth. Investasi & Pasar Modal" />
            <TextField label="Nomor Kontak" value={form.kontak} onChange={(v) => setForm({ ...form, kontak: v })} placeholder="08xx-xxxx-xxxx" />
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button onClick={submit} className="mt-3.5 px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm">
            Simpan
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="text-sm text-[#5b6472]">Memuat data...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#5b6472]">Belum ada narasumber terdaftar.</p>
        ) : (
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-[#5b6472] text-xs uppercase tracking-wide">
                <th className="py-2 border-b border-[#e3e8f0]">Nama</th>
                <th className="py-2 border-b border-[#e3e8f0]">Bidang Keahlian</th>
                <th className="py-2 border-b border-[#e3e8f0]">Kontak</th>
                <th className="py-2 border-b border-[#e3e8f0]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td className="py-2.5 border-b border-[#e3e8f0] font-medium">{n.nama}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{n.bidang_keahlian || '-'}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{n.kontak || '-'}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">
                    <button onClick={() => hapus(n.id)} className="text-[#a3372b] text-[12.5px] font-semibold">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isSupabaseConfigured && (
          <p className="text-xs text-[#9aa5b1] mt-3">Mode demo — sambungkan Supabase di .env.local untuk data sungguhan.</p>
        )}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
      />
    </div>
  )
}
