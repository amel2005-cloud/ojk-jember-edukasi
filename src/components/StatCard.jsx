export default function StatCard({ num, label, accent }) {
  return (
    <div className={`card ${accent ? 'border-t-[3px] border-t-gold-500' : ''}`}>
      <div className="font-serif text-2xl font-black text-navy-950">{num}</div>
      <div className="text-xs text-[#5b6472] mt-0.5">{label}</div>
    </div>
  )
}
