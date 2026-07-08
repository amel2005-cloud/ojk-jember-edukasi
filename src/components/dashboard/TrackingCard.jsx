import Stepper from '../Stepper'

export default function TrackingCard() {
  return (
    <div className="card">
      <h3 className="text-[15px] mb-3.5 text-navy-950">
        Tracking Pengajuan #0012
      </h3>

      <Stepper currentIndex={2} />

      <p className="text-[13px] text-[#5b6472] mt-3.5">
        <b>SMAN 2 Jember</b> · 15 Okt 2026, 09.00
        <br />
        Narasumber: AAB
      </p>
    </div>
  )
}
