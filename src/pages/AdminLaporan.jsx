import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

const BULAN_LIST = [
  { v: 1, l: 'Januari' }, { v: 2, l: 'Februari' }, { v: 3, l: 'Maret' }, { v: 4, l: 'April' },
  { v: 5, l: 'Mei' }, { v: 6, l: 'Juni' }, { v: 7, l: 'Juli' }, { v: 8, l: 'Agustus' },
  { v: 9, l: 'September' }, { v: 10, l: 'Oktober' }, { v: 11, l: 'November' }, { v: 12, l: 'Desember' },
]

export default function AdminLaporan() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState('semua')

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from('pengajuan')
        .select('id, nomor_urut, status, created_at, tanggal_final, instansi(nama, kabupaten), pengajuan_materi(materi(nama))')
        .order('created_at', { ascending: false })
      if (error) console.error('[laporan]', error)
      setRows(
        (data || []).map((r) => ({
          id: r.id,
          nomor_urut: r.nomor_urut,
          instansi: r.instansi?.nama ?? '-',
          kabupaten: r.instansi?.kabupaten ?? '-',
          materi: (r.pengajuan_materi || []).map((m) => m.materi?.nama).join(', '),
          created_at: r.created_at,
          status: r.status,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (!r.created_at) return false
      const d = new Date(r.created_at)
      const matchTahun = d.getFullYear() === Number(tahun)
      const matchBulan = bulan === 'semua' || d.getMonth() + 1 === Number(bulan)
      return matchTahun && matchBulan
    })
  }, [rows, tahun, bulan])

  const summary = useMemo(() => {
    const s = { total: filtered.length, approved: 0, rejected: 0, selesai: 0, pending: 0 }
    filtered.forEach((r) => {
      if (r.status === 'approved') s.approved++
      else if (r.status === 'rejected') s.rejected++
      else if (r.status === 'selesai') s.selesai++
      else s.pending++
    })
    return s
  }, [filtered])

  function exportCSV() {
    const header = ['No', 'Instansi', 'Kabupaten', 'Materi', 'Tanggal Diajukan', 'Status']
    const csvRows = filtered.map((r) => [r.nomor_urut, r.instansi, r.kabupaten, r.materi, r.created_at, r.status])
    const csv = [header, ...csvRows].map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-pengajuan-${tahun}-${bulan === 'semua' ? 'semua' : bulan}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">Laporan</h1>
        <p className="text-sm text-[#5b6472]">Rekap pengajuan kegiatan edukasi, bisa difilter per bulan/tahun dan diekspor.</p>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">Tahun</label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-28 px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            >
              <option value="semua">Semua bulan (laporan tahunan)</option>
              {BULAN_LIST.map((b) => (
                <option key={b.v} value={b.v}>{b.l}</option>
              ))}
            </select>
          </div>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm disabled:opacity-50"
          >
            Export CSV / Excel ↓
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <SummaryCard num={summary.total} label="Total" />
        <SummaryCard num={summary.pending} label="Pending/Diproses/Revisi" />
        <SummaryCard num={summary.approved} label="Approved" />
        <SummaryCard num={summary.rejected} label="Rejected" />
        <SummaryCard num={summary.selesai} label="Selesai" />
      </div>

      <div className="card">
        {loading ? (
          <p className="text-sm text-[#5b6472]">Memuat data...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#5b6472]">Tidak ada data untuk periode ini.</p>
        ) : (
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-[#5b6472] text-xs uppercase tracking-wide">
                <th className="py-2 border-b border-[#e3e8f0]">No.</th>
                <th className="py-2 border-b border-[#e3e8f0]">Instansi</th>
                <th className="py-2 border-b border-[#e3e8f0]">Kabupaten</th>
                <th className="py-2 border-b border-[#e3e8f0]">Materi</th>
                <th className="py-2 border-b border-[#e3e8f0]">Tanggal</th>
                <th className="py-2 border-b border-[#e3e8f0]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 border-b border-[#e3e8f0]">#{r.nomor_urut}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.instansi}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.kabupaten}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.materi}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.created_at}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">
                    <span className={`badge b-${r.status}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ num, label }) {
  return (
    <div className="card">
      <div className="font-serif text-2xl font-black text-navy-950">{num}</div>
      <div className="text-xs text-[#5b6472] mt-0.5">{label}</div>
    </div>
  )
}
