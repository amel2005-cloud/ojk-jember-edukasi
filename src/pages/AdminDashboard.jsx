import React, { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { dummyStats, dummyPengajuan, dummyBulanan } from '../data/dummy'
import StatCard from '../components/StatCard'
import Stepper from '../components/Stepper'

const BULAN_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function AdminDashboard() {
  const [stats, setStats] = useState(dummyStats)
  const [rows, setRows] = useState(dummyPengajuan)
  const [openRow, setOpenRow] = useState(null) // id baris yang lagi dibuka panel approve-nya
  const [finalDate, setFinalDate] = useState('')
  const [finalTime, setFinalTime] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [chartData, setChartData] = useState(isSupabaseConfigured ? new Array(12).fill(0) : dummyBulanan.data)
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  async function loadData() {
    if (!isSupabaseConfigured) return // tetap pakai data dummy
    const { data: statData, error: statErr } = await supabase.from('v_stat_ringkasan').select('*').single()
    if (statErr) console.error('[v_stat_ringkasan]', statErr)
    if (statData) setStats(statData)

    const { data: pengajuanData, error: pengErr } = await supabase
      .from('pengajuan')
      .select('id, nomor_urut, status, created_at, tanggal_pilihan_1, instansi(nama), pengajuan_materi(materi(nama))')
      .order('created_at', { ascending: false })
      .limit(20)
    if (pengErr) console.error('[pengajuan]', pengErr)
    if (pengajuanData) {
      setRows(
        pengajuanData.map((r) => ({
          id: r.id,
          nomor_urut: r.nomor_urut,
          instansi: r.instansi?.nama ?? '-',
          materi: (r.pengajuan_materi || []).map((m) => m.materi?.nama).join(', '),
          created_at: r.created_at,
          status: r.status,
          tanggal_pilihan_1: r.tanggal_pilihan_1,
        }))
      )
    }

    // Hitung jumlah pengajuan per bulan (tahun berjalan) dari data ASLI, bukan dummy
    const { data: semuaTanggal, error: tglErr } = await supabase.from('pengajuan').select('created_at')
    if (tglErr) console.error('[pengajuan created_at]', tglErr)
    if (semuaTanggal) {
      const tahunIni = new Date().getFullYear()
      const perBulan = new Array(12).fill(0)
      semuaTanggal.forEach((r) => {
        if (!r.created_at) return
        const d = new Date(r.created_at)
        if (d.getFullYear() === tahunIni) perBulan[d.getMonth()]++
      })
      setChartData(perBulan)
    }
  }

  useEffect(() => {
  const init = async () => {
    await loadData()
  }

  init()
}, [])

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: BULAN_LABELS,
        datasets: [{ label: 'Pengajuan', data: chartData, backgroundColor: '#8b1e2d', borderRadius: 6, maxBarThickness: 34 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: '#eef1f5' }, ticks: { precision: 0 } }, x: { grid: { display: false } } },
      },
    })
    return () => chartRef.current?.destroy()
  }, [chartData])

  // Ubah status pengajuan + catat ke status_log
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[22px] text-navy-950 mb-1">Dashboard Pengajuan Edukasi</h1>
          <p className="text-sm text-[#5b6472]">Ringkasan seluruh pengajuan kegiatan edukasi keuangan — diperbarui hari ini.</p>
        </div>
        <span className="bg-gold-100 text-gold-500 font-bold text-[11px] px-2.5 py-1.5 rounded-full uppercase tracking-wide">
          Super Admin
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <StatCard num={stats.total_semua} label="Total Pengajuan" />
        <StatCard num={stats.total_pending} label="Pending" accent />
        <StatCard num={stats.total_diproses} label="Diproses" />
        <StatCard num={stats.total_approved} label="Approved" />
        <StatCard num={stats.total_rejected} label="Rejected" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mb-6">
        <div className="card">
          <h3 className="text-[15px] mb-3.5 text-navy-950">Tren Pengajuan per Bulan ({new Date().getFullYear()})</h3>
          <canvas ref={canvasRef} height="150" />
        </div>
        <div className="card">
          <h3 className="text-[15px] mb-3.5 text-navy-950">Tracking Pengajuan #0012</h3>
          <Stepper currentIndex={2} />
          <p className="text-[13px] text-[#5b6472] mt-3.5">
            <b>SMAN 2 Jember</b> · 15 Okt 2026, 09.00
            <br />
            Narasumber: Andi Prasetyo
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-[15px] mb-3.5 text-navy-950">Pengajuan Terbaru</h3>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="text-left text-[#5b6472] text-xs uppercase tracking-wide">
              <th className="py-2 border-b border-[#e3e8f0]">No.</th>
              <th className="py-2 border-b border-[#e3e8f0]">Instansi</th>
              <th className="py-2 border-b border-[#e3e8f0]">Materi</th>
              <th className="py-2 border-b border-[#e3e8f0]">Tanggal</th>
              <th className="py-2 border-b border-[#e3e8f0]">Status</th>
              <th className="py-2 border-b border-[#e3e8f0]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.id ?? r.nomor_urut}>
                <tr>
                  <td className="py-2.5 border-b border-[#e3e8f0]">#{r.nomor_urut}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.instansi}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.materi}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">{r.created_at}</td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">
                    <span className={`badge b-${r.status}`}>{r.status}</span>
                  </td>
                  <td className="py-2.5 border-b border-[#e3e8f0]">
                    {isSupabaseConfigured && r.id && ['pending', 'diproses', 'revisi'].includes(r.status) ? (
                      <div className="flex gap-1.5">
                        <button
                          disabled={busyId === r.id}
                          onClick={() => openApprovePanel(r)}
                          className="px-2.5 py-1 rounded-md bg-[#227a53] text-white text-[11.5px] font-semibold disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => updateStatus(r, 'revisi')}
                          className="px-2.5 py-1 rounded-md bg-[#b5580f] text-white text-[11.5px] font-semibold disabled:opacity-50"
                        >
                          Revisi
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => updateStatus(r, 'rejected')}
                          className="px-2.5 py-1 rounded-md bg-[#a3372b] text-white text-[11.5px] font-semibold disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#9aa5b1] text-xs">—</span>
                    )}
                  </td>
                </tr>
                {openRow === r.id && (
                  <tr>
                    <td colSpan={6} className="bg-[#f7f9fc] border-b border-[#e3e8f0] py-3 px-3">
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="block text-[11.5px] font-semibold text-[#5b6472] mb-1">Tanggal Final</label>
                          <input
                            type="date"
                            value={finalDate}
                            onChange={(e) => setFinalDate(e.target.value)}
                            className="px-2.5 py-1.5 border border-[#e3e8f0] rounded-md text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-semibold text-[#5b6472] mb-1">Jam</label>
                          <input
                            type="time"
                            value={finalTime}
                            onChange={(e) => setFinalTime(e.target.value)}
                            className="px-2.5 py-1.5 border border-[#e3e8f0] rounded-md text-[13px]"
                          />
                        </div>
                        <button
                          onClick={() => confirmApprove(r)}
                          disabled={busyId === r.id}
                          className="px-3.5 py-1.5 rounded-md bg-[#227a53] text-white text-[12.5px] font-bold disabled:opacity-50"
                        >
                          Konfirmasi Approve
                        </button>
                        <button
                          onClick={() => setOpenRow(null)}
                          className="px-3.5 py-1.5 rounded-md bg-white border border-[#e3e8f0] text-[#5b6472] text-[12.5px] font-semibold"
                        >
                          Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {!isSupabaseConfigured && (
          <p className="text-xs text-[#9aa5b1] mt-3">Mode demo — sambungkan Supabase di .env.local untuk aksi Approve/Reject sungguhan.</p>
        )}
      </div>
    </div>
  )
}
