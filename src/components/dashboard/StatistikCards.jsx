import StatCard from '../StatCard'

export default function StatistikCards({ stats }) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <StatCard num={stats.total_semua ?? 0} label="Total Pengajuan" />
      <StatCard num={stats.total_pending ?? 0} label="Pending" accent />
      <StatCard num={stats.total_diproses ?? 0} label="Diproses" />
      <StatCard num={stats.total_approved ?? 0} label="Approved" />
      <StatCard num={stats.total_rejected ?? 0} label="Rejected" />
    </div>
  )
}
