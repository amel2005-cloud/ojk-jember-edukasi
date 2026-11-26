
import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { formatTanggal } from '../utils/formatDate'

const STATUS_LIST = ['pending', 'diproses', 'revisi', 'approved', 'rejected', 'selesai']

const STATUS_LABEL = {
  pending: 'Diterima',
  diproses: 'Diverifikasi',
  revisi: 'Perlu Revisi',
  approved: 'Approved',
  rejected: 'Ditolak',
  selesai: 'Selesai',
}

export default function AdminPengajuan() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [openRow, setOpenRow] = useState(null)
  const [detailRow, setDetailRow] = useState(null)
  const [finalDate, setFinalDate] = useState('')
  const [finalTime, setFinalTime] = useState('09:00')
  const [busyId, setBusyId] = useState(null)

  async function loadData() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('pengajuan')
      .select(`
        id,
        nomor_urut,
        status,
        created_at,
        tanggal_pilihan_1,
        tanggal_pilihan_2,
        jumlah_peserta,
        lokasi_kegiatan,
        tema_kegiatan,
        instansi(nama, kabupaten, jenis, pic_nama, pic_hp),
        pengajuan_materi(materi(nama))
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[admin pengajuan]', error)
      alert('Gagal memuat pengajuan: ' + error.message)
      setLoading(false)
      return
    }

    setRows(
      (data || []).map((r) => ({
        id: r.id,
        nomor_urut: r.nomor_urut,
        instansi: r.instansi?.nama ?? '-',
        kabupaten: r.instansi?.kabupaten ?? '-',
        jenis: r.instansi?.jenis ?? '-',
        pic_nama: r.instansi?.pic_nama ?? '-',
        pic_hp: r.instansi?.pic_hp ?? '-',
        materi: (r.pengajuan_materi || [])
          .map((m) => m.materi?.nama)
          .filter(Boolean)
          .join(', '),
        created_at: r.created_at,
        status: r.status,
        tanggal_pilihan_1: r.tanggal_pilihan_1,
        tanggal_pilihan_2: r.tanggal_pilihan_2,
        jumlah_peserta: r.jumlah_peserta,
        lokasi_kegiatan: r.lokasi_kegiatan,
        tema_kegiatan: r.tema_kegiatan,
      }))
    )

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const keyword = search.toLowerCase().trim()

      const matchSearch =
        keyword === '' ||
        r.instansi.toLowerCase().includes(keyword) ||
        r.pic_nama.toLowerCase().includes(keyword) ||
        String(r.nomor_urut).includes(keyword)

      const matchStatus =
        statusFilter === 'semua' || r.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [rows, search, statusFilter])

  function openApprovePanel(row) {
    setOpenRow(row.id)
    setFinalDate(row.tanggal_pilihan_1 || '')
    setFinalTime('09:00')
  }

  function closeApprovePanel() {
    setOpenRow(null)
    setFinalDate('')
    setFinalTime('09:00')
  }

  
async function updateStatus(row, newStatus, extra = {}) {
  if (!isSupabaseConfigured || !row.id) return

  setBusyId(row.id)

  try {
    const { data, error } = await supabase
      .from('pengajuan')
      .update({
        status: newStatus,
        ...extra,
      })
      .eq('id', row.id)
      .select('id, status')

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error(
        'Tidak ada data yang berhasil diperbarui. Periksa ID pengajuan dan izin UPDATE pada Supabase.'
      )
    }

    const { error: logError } = await supabase
      .from('status_log')
      .insert({
        pengajuan_id: row.id,
        status: newStatus,
      })

    if (logError) {
      console.error('[status_log]', logError)
    }

    alert(
      `Status pengajuan berhasil diubah menjadi ${STATUS_LABEL[newStatus] || newStatus}.`
    )

    closeApprovePanel()
    await loadData()
  } catch (error) {
    console.error('[update status]', error)
    alert('Gagal mengubah status: ' + error.message)
  } finally {
    setBusyId(null)
  }
}


  function confirmApprove(row) {
    if (!finalDate) {
      alert('Silakan pilih tanggal final terlebih dahulu.')
      return
    }

    if (!finalTime) {
      alert('Silakan pilih jam kegiatan terlebih dahulu.')
      return
    }

    updateStatus(row, 'approved', {
      tanggal_final: finalDate,
      jam_final: finalTime,
    })
  }

  return (
    <div className="flex-1 p-5 md:p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-[22px] text-navy-950 mb-1">
          Kelola Pengajuan
        </h1>
        <p className="text-sm text-[#5b6472]">
          Cari, filter, dan proses seluruh pengajuan kegiatan edukasi.
        </p>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
              Cari instansi / PIC / nomor
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="cth. SMAN 2, Budi, atau 0012"
              className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            >
              <option value="semua">Semua status</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[13px] text-[#5b6472] pb-2.5">
            Menampilkan {filteredRows.length} dari {rows.length} pengajuan
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-[#5b6472]">Memuat data...</p>
        ) : (
          <table className="w-full border-collapse text-[13.5px] min-w-[1050px]">
            <thead>
              <tr className="text-left text-[#5b6472] text-xs uppercase tracking-wide">
                <th className="py-2 border-b border-[#e3e8f0]">No.</th>
                <th className="py-2 border-b border-[#e3e8f0]">Instansi</th>
                <th className="py-2 border-b border-[#e3e8f0]">Kabupaten</th>
                <th className="py-2 border-b border-[#e3e8f0]">PIC</th>
                <th className="py-2 border-b border-[#e3e8f0]">No. HP PIC</th>
                <th className="py-2 border-b border-[#e3e8f0]">Materi</th>
                <th className="py-2 border-b border-[#e3e8f0]">Detail</th>
                <th className="py-2 border-b border-[#e3e8f0]">Tanggal</th>
                <th className="py-2 border-b border-[#e3e8f0]">Status</th>
                <th className="py-2 border-b border-[#e3e8f0]">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-[#9aa5b1]">
                    Tidak ada pengajuan yang cocok dengan filter.
                  </td>
                </tr>
              )}

              {filteredRows.map((r) => (
                <RowGroup
                  key={r.id}
                  r={r}
                  isOpen={openRow === r.id}
                  finalDate={finalDate}
                  setFinalDate={setFinalDate}
                  finalTime={finalTime}
                  setFinalTime={setFinalTime}
                  busyId={busyId}
                  onDetail={() => setDetailRow(r)}
                  onApproveClick={() => openApprovePanel(r)}
                  onRevisi={() => updateStatus(r, 'revisi')}
                  onReject={() => updateStatus(r, 'rejected')}
                  onConfirmApprove={() => confirmApprove(r)}
                  onCancel={closeApprovePanel}
                />
              ))}
            </tbody>
          </table>
        )}

        {!isSupabaseConfigured && (
          <p className="text-xs text-[#9aa5b1] mt-3">
            Mode demo — sambungkan Supabase di .env.local untuk data &amp; aksi sungguhan.
          </p>
        )}
      </div>

      {detailRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetailRow(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[#e3e8f0] px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-navy-950">
                  Detail Pengajuan
                </h2>
                <p className="text-sm text-[#5b6472]">
                  Nomor Pengajuan #{detailRow.nomor_urut}
                </p>
              </div>

              <button
                onClick={() => setDetailRow(null)}
                className="text-2xl text-[#5b6472] hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <DetailSection title="Informasi Instansi">
                <DetailItem label="Nama Instansi" value={detailRow.instansi} />
                <DetailItem label="Kabupaten" value={detailRow.kabupaten} />
                <DetailItem label="Jenis Instansi" value={detailRow.jenis} />
              </DetailSection>

              <DetailSection title="Penanggung Jawab">
                <DetailItem label="Nama PIC" value={detailRow.pic_nama} />
                <DetailItem label="Nomor HP PIC" value={detailRow.pic_hp} />
              </DetailSection>

              <DetailSection title="Detail Kegiatan">
                <DetailItem label="Tanggal Pilihan 1" value={detailRow.tanggal_pilihan_1 || '-'} />
                <DetailItem label="Tanggal Pilihan 2" value={detailRow.tanggal_pilihan_2 || '-'} />
                <DetailItem
                  label="Jumlah Peserta"
                  value={detailRow.jumlah_peserta ? `${detailRow.jumlah_peserta} orang` : '-'}
                />
                <DetailItem label="Lokasi Kegiatan" value={detailRow.lokasi_kegiatan || '-'} />
                <DetailItem label="Tema Kegiatan" value={detailRow.tema_kegiatan || '-'} />
              </DetailSection>

              <DetailSection title="Materi yang Diajukan">
                <DetailItem label="Daftar Materi" value={detailRow.materi || '-'} />
              </DetailSection>

              <DetailSection title="Informasi Pengajuan">
                <DetailItem label="Tanggal Pengajuan" value={formatTanggal(detailRow.created_at)} />
                <DetailItem label="Status" value={STATUS_LABEL[detailRow.status] || detailRow.status} />
              </DetailSection>
            </div>

            <div className="px-6 py-4 border-t border-[#e3e8f0] flex justify-end">
              <button
                onClick={() => setDetailRow(null)}
                className="px-5 py-2 rounded-lg bg-[#1d5dad] text-white text-sm font-semibold hover:bg-[#174b8d]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <div className="border border-[#e3e8f0] rounded-xl p-4">
      <h3 className="font-bold text-[#1d5dad] mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-1">
      <span className="text-[#7b8491]">{label}</span>
      <span className="font-medium text-[#273244] break-words">{value}</span>
    </div>
  )
}

function RowGroup({
  r,
  isOpen,
  finalDate,
  setFinalDate,
  finalTime,
  setFinalTime,
  busyId,
  onDetail,
  onApproveClick,
  onRevisi,
  onReject,
  onConfirmApprove,
  onCancel,
}) {
  const canAct = r.id && ['pending', 'diproses', 'revisi'].includes(r.status)
  const isBusy = busyId === r.id

  return (
    <>
      <tr>
        <td className="py-2.5 border-b border-[#e3e8f0]">#{r.nomor_urut}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.instansi}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.kabupaten}</td>
        <td className="py-2.5 border-b border-[#e3e8f0]">{r.pic_nama}</td>

        <td className="py-2.5 border-b border-[#e3e8f0]">
          {r.pic_hp && r.pic_hp !== '-' ? (
            <a
              href={`https://wa.me/${r.pic_hp.replace(/\D/g, '').replace(/^0/, '62')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1d5dad] font-medium"
            >
              {r.pic_hp}
            </a>
          ) : '-'}
        </td>

        <td className="py-2.5 border-b border-[#e3e8f0]">{r.materi || '-'}</td>

        <td className="py-2.5 border-b border-[#e3e8f0]">
          <button
            type="button"
            onClick={onDetail}
            className="px-2.5 py-1 rounded-md bg-[#1d5dad] text-white text-[11.5px] font-semibold hover:bg-[#174b8d]"
          >
            Lihat Detail
          </button>
        </td>

        <td className="py-2.5 border-b border-[#e3e8f0]">
          {formatTanggal(r.created_at)}
        </td>

        <td className="py-2.5 border-b border-[#e3e8f0]">
          <span className={`badge b-${r.status}`}>
            {STATUS_LABEL[r.status] || r.status}
          </span>
        </td>

        <td className="py-2.5 border-b border-[#e3e8f0]">
          {canAct ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={isBusy}
                onClick={onApproveClick}
                className="px-2.5 py-1 rounded-md bg-[#227a53] text-white text-[11.5px] font-semibold hover:bg-[#195d3e] disabled:opacity-50"
              >
                Approve
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={onRevisi}
                className="px-2.5 py-1 rounded-md bg-[#b5580f] text-white text-[11.5px] font-semibold disabled:opacity-50"
              >
                Revisi
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={onReject}
                className="px-2.5 py-1 rounded-md bg-[#a3372b] text-white text-[11.5px] font-semibold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-[#9aa5b1] text-xs">
              {r.status === 'approved' || r.status === 'selesai'
                ? 'Sudah disetujui'
                : '—'}
            </span>
          )}
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={10} className="bg-[#f0f7f3] border-b border-[#c9dfd1] p-4">
            <div className="rounded-xl border border-[#c9dfd1] bg-white p-4">
              <div className="mb-4">
                <h3 className="font-bold text-[#195d3e] text-base">
                  Konfirmasi Persetujuan Pengajuan
                </h3>
                <p className="text-sm text-[#5b6472] mt-1">
                  Tentukan tanggal dan jam final sebelum menyetujui pengajuan #{r.nomor_urut}.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5b6472] mb-1.5">
                    Tanggal Final
                  </label>
                  <input
                    type="date"
                    value={finalDate}
                    onChange={(e) => setFinalDate(e.target.value)}
                    className="px-3 py-2 border border-[#d5ded8] rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#5b6472] mb-1.5">
                    Jam Kegiatan
                  </label>
                  <input
                    type="time"
                    value={finalTime}
                    onChange={(e) => setFinalTime(e.target.value)}
                    className="px-3 py-2 border border-[#d5ded8] rounded-lg text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={onConfirmApprove}
                  disabled={isBusy}
                  className="px-5 py-2 rounded-lg bg-[#227a53] text-white text-sm font-bold hover:bg-[#195d3e] disabled:opacity-50"
                >
                  {isBusy ? 'Menyimpan...' : 'Konfirmasi Approve'}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isBusy}
                  className="px-5 py-2 rounded-lg bg-white border border-[#d5ded8] text-[#5b6472] text-sm font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
