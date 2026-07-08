const STEPS = ['Diterima', 'Diverifikasi', 'Approved', 'Selesai']

export default function Stepper({ currentIndex = 2 }) {
  return (
    <div className="flex items-center my-2">
      {STEPS.map((label, i) => {
        const done = i <= currentIndex
        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            <div
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] font-bold z-10 ${
                done ? 'bg-[#227a53] text-white' : 'bg-[#dbe1ea] text-[#8b95a5]'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`absolute top-[11px] left-1/2 w-full h-0.5 ${
                  i < currentIndex ? 'bg-[#227a53]' : 'bg-[#dbe1ea]'
                }`}
              />
            )}
            <div className="text-[11px] text-[#5b6472] mt-1.5 text-center">{label}</div>
          </div>
        )
      })}
    </div>
  )
}
