import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { dummyBulanan } from '../../data/dummy'

export default function DashboardChart() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: dummyBulanan.labels,
        datasets: [
          {
            label: 'Pengajuan',
            data: dummyBulanan.data,
            backgroundColor: '#164b8f',
            borderRadius: 6,
            maxBarThickness: 34,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#eef1f5',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  return (
    <div className="card">
      <h3 className="text-[15px] mb-3.5 text-navy-950">
        Tren Pengajuan per Bulan
      </h3>

      <canvas ref={canvasRef} height={150} />
    </div>
  )
}
