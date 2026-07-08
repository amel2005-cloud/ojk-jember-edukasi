export default function Logo({ size = 38, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
     <img
  src="/images/logo-ojk.png"
  alt="OJK Jember"
  style={{ height: size }}
  className="flex-shrink-0"
/>
      <div className={`brand font-black leading-none ${light ? 'text-white' : 'text-navy-950'}`} style={{ fontSize: size * 0.42 }}>
      </div>
    </div>
  )
}