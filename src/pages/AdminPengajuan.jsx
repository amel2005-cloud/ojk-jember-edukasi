import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { dummyPengajuan } from '../data/dummy'

const STATUS_LIST = ['pending', 'diproses', 'revisi', 'approved', 'rejected', 'selesai']

export default function AdminPengajuan() {
  const [rows, setRows] = useState(dummyPengajuan)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [openRow, setOpenRow] = useState(null)
  const [finalDate, setFinalDate] = useState('')
  const [finalTime, setFinalTime] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function loadData() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('pengajuan')
      .select(
        'id, nomor_urut, status, created_at, tanggal_pilihan_1, instansi(nama, kabupaten), pengajuan_materi(materi(nama))'
      )
      .order('created_at', { ascending: false })
    if (error) console.error('[admin pengajuan]', error)
    if (data) {
      setRows(
        data.map((r) => ({
          id: r.id,
          nomor_urut: r.nomor_urut,
          instansi: r.instansi?.nama ?? '-',
          kabupaten: r.instansi?.kabupaten ?? '-',
          materi: (r.pengajuan_materi || []).map((m) => m.materi?.nama).join(', '),
          created_at: r.created_at,
          status: r.status,
          tanggal_pilihan_1: r.tanggal_pilihan_1,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
  const id = setTimeout(() => {
    loadData()
  }, 0)

  return () => clearTimeout(id)
}, [])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        search.trim() === '' ||
        r.instansi.toLowerCase().includes(search.toLowerCase()) ||
        String(r.nomor_urut).includes(search)
      const matchStatus = statusFilter === 'semua' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [rows, search, statusFilter])

  async function updateStatus(row, newStatus, extra = {}) {
    if (!isSupabaseConfigured) return
    setBusyId(row.id)
    const { error } = await supabase.from('pengajuan').update({ status: newStatus, ...extra }).eq('id', row.id)
    if (!error) {
      await supabase.from('status_log').insert({ pengajuan_id: row.id, status: newStatus })
      setOpenRow(null)
      setFinalDate('')
      setFinalTime('')
      await loadData()
    } else {
      alert('Gagal update status: ' + error.message)
    }
    setBusyId(null)
  }

  function openApprovePanel(row) {
    setOpenRow(row.id)
    setFinalDate(row.tanggal_pilihan_1 || '')
    setFinalTime('09:00')
  }

  function confirmApprove(row) {
    if (!finalDate) {
      alert('Pilih tanggal final dulu.')
      return
    }
    updateStatus(row, 'approved', { tanggal_final: finalDate, jam_final: finalTime })
  }

  return (
    <div className="flex-1 p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">Kelola Pengajuan</h1>
        <p className="text-sm text-[#5b6472]">Cari, filter, dan proses seluruh pengajuan kegiatan edukasi.</p>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">Cari instansi / nomor</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="cth. SMAN 2 atau 0012"
              className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            >
              <option value="semua">Semua status</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="text-[13px] text-[#5b6472] pb-2.5">
            Menampilkan {filteredRows.length} dari {rows.length} pengajuan
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-sm text-[#5b6472]">Memuat data...</p>
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
                <th className="py-2 border-b border-[#e3e8f0]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#9aa5b1]">
                    Tidak ada pengajuan yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {filteredRows.map((r) => (
                <RowGroup
                  key={r.id ?? r.nomor_urut}
                  r={r}
                  isOpen={openRow === r.id}
                  finalDate={finalDate}
                  setFinalDate={setFinalDate}
                  finalTime={finalTime}
                  setFinalTime={setFinalTime}
                  busyId={busyId}
                  onApproveClick={() => openApprovePanel(r)}
                  onRevisi={() => updateStatus(r, 'revisi')}
                  onReject={() => updateStatus(r, 'rejected')}
                  onConfirmApprove={() => confirmApprove(r)}
                  onCancel={() => setOpenRow(null)}
                />
              ))}
            </tbody>
          </table>
        )}
        {!isSupabaseConfigured && (
          <p className="text-xs text-[#9aa5b1] mt-3">Mode demo — sambungkan Supabase di .env.local untuk data &amp; aksi sungguhan.</p>
        )}
      </div>
    </div>
  )
}

function RowGroup({ r, isOpen, finalDate, setFinalDate, finalTime, setFinalTime, busyId, onApproveClick, onRevisi, onReject, onConfirmApprove, onCancel }) {
  const canAct = r.id && ['pending', 'diproses', 'revisi'].includes(r.status)
  return (
    <>
      <tr>
        <td className="py-2.5 border-b border-[#e3e8f0]">#{r.nomor_urut}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.instansi}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.kabupaten}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.materi}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.created_at}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">
          <span className={`badge b-${r.status}`}>{r.status}</span>
        </td>
        <td className="py-2.5 border-b border-[#e3e8f0]">
          {canAct ? (
            <div className="flex gap-1.5">
              <button disabled={busyId === r.id} onClick={onApproveClick} className="px-2.5 py-1 rounded-md bg-[#227a53] text-white text-[11.5px] font-semibold disabled:opacity-50">Approve</button>
              <button disabled={busyId === r.id} onClick={onRevisi} className="px-2.5 py-1 rounded-md bg-[#b5580f] text-white text-[11.5px] font-semibold disabled:opacity-50">Revisi</button>
              <button disabled={busyId === r.id} onClick={onReject} className="px-2.5 py-1 rounded-md bg-[#a3372b] text-white text-[11.5px] font-semibold disabled:opacity-50">Reject</button>
            </div>
          ) : (
            <span className="text-[#9aa5b1] text-xs">—</span>
          )}
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} className="bg-[#f7f9fc] border-b border-[#e3e8f0] py-3 px-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#5b6472] mb-1">Tanggal Final</label>
                <input type="date" value={finalDate} onChange={(e) => setFinalDate(e.target.value)} className="px-2.5 py-1.5 border border-[#e3e8f0] rounded-md text-[13px]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#5b6472] mb-1">Jam</label>
                <input type="time" value={finalTime} onChange={(e) => setFinalTime(e.target.value)} className="px-2.5 py-1.5 border border-[#e3e8f0] rounded-md text-[13px]" />
              </div>
              <button onClick={onConfirmApprove} disabled={busyId === r.id} className="px-3.5 py-1.5 rounded-md bg-[#227a53] text-white text-[12.5px] font-bold disabled:opacity-50">Konfirmasi Approve</button>
              <button onClick={onCancel} className="px-3.5 py-1.5 rounded-md bg-white border border-[#e3e8f0] text-[#5b6472] text-[12.5px] font-semibold">Batal</button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
