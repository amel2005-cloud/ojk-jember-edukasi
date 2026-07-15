import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import StatCard from '../components/StatCard'

const BULAN_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const STATS_KOSONG = { total_semua: 0, total_pending: 0, total_diproses: 0, total_approved: 0, total_rejected: 0 }

export default function AdminDashboard() {
  const [stats, setStats] = useState(STATS_KOSONG)
  const [chartData, setChartData] = useState(new Array(12).fill(0))
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  async function loadData() {
    if (!isSupabaseConfigured) return

    const { data: statData, error: statErr } = await supabase.from('v_stat_ringkasan').select('*').single()
    if (statErr) console.error('[v_stat_ringkasan]', statErr)
    if (statData) setStats(statData)

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
    let cancelled = false
    async function run() {
      if (cancelled) return
      await loadData()
    }
    run()
    return () => {
      cancelled = true
    }
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

  return (
    <div className="flex-1 p-5 md:p-8 lg:p-10">
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

      <div className="card">
        <h3 className="text-[15px] mb-3.5 text-navy-950">Tren Pengajuan per Bulan ({new Date().getFullYear()})</h3>
        <canvas ref={canvasRef} height="90" />
      </div>
    </div>
  )
}
