import Logo from '../components/Logo'

export default function Landing({ onEnterSystem }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: "url('/images/login-bg.jpg')",
      }}
    >
      {/* Overlay vintage golden */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            linear-gradient(
              100deg,
              rgba(30, 20, 12, 0.82) 0%,
              rgba(91, 65, 35, 0.56) 43%,
              rgba(166, 130, 76, 0.34) 72%,
              rgba(194, 158, 99, 0.22) 100%
            )
          `,
        }}
      />

      {/* Warm golden tint */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundColor: 'rgba(181, 154, 112, 0.20)',
          mixBlendMode: 'color',
        }}
      />

      {/* Grainy film texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-35"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Fine vintage crack texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[4] opacity-20"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f2dfbd' stroke-width='.7' opacity='.7'%3E%3Cpath d='M40 0 L55 48 L42 75 L70 112 L60 150 L88 185 L75 225 L105 270 L95 315 L130 355 L115 410 L145 500'/%3E%3Cpath d='M55 48 L20 70 L0 62 M42 75 L12 105 L0 100 M70 112 L110 95 L130 65 M60 150 L25 180 L0 175 M88 185 L125 170 L150 145 M75 225 L40 250 L15 290 M105 270 L145 250 L175 220 M95 315 L60 350 L30 390 M130 355 L170 335 L195 300 M115 410 L80 445 L65 480'/%3E%3Cpath d='M300 0 L285 45 L310 85 L290 125 L325 165 L300 205 L335 245 L315 285 L350 330 L335 380 L370 420 L355 500'/%3E%3Cpath d='M285 45 L245 55 L220 85 M310 85 L350 65 L380 35 M290 125 L255 145 L230 175 M325 165 L365 150 L400 120 M300 205 L265 225 L240 260 M335 245 L375 230 L410 200 M315 285 L280 310 L255 345 M350 330 L390 310 L425 280 M335 380 L300 410 L280 450'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundSize: '500px 500px',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative z-10 p-6 md:p-8 flex items-center justify-between">
        <Logo size={34} />

        <a
          href="https://sigap-ojk.vercel.app"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <span>⌂</span>
          <span className="text-sm font-semibold">Home</span>
        </a>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16 md:pb-0 text-center">
        <div className="max-w-2xl flex flex-col items-center">
          <h1
            className="text-white text-7xl md:text-8xl tracking-wide mb-3 drop-shadow-lg"
            style={{ fontFamily: "'Squada One', sans-serif" }}
          >
            VISIT OJK JEMBER
          </h1>

          <h2
            className="text-white font-bold text-xl md:text-2xl leading-snug mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
          </h2>

          <p
            className="text-white/90 text-sm md:text-base mb-8 max-w-md leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Layanan informasi terintegrasi untuk memfasilitasi pengajuan, pengelolaan, dan pemantauan permohonan kunjungan ke OJK.
          </p>

          <button
            onClick={onEnterSystem}
            className="px-7 py-3.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              background:
                'linear-gradient(110deg, #5c0f18 0%, #7b1c29 50%, #5c0f18 100%)',
            }}
          >
            <span>Masuk ke Sistem</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <img
        src="/images/jun.png"
        alt=""
        className="hidden md:block absolute right-6 lg:right-16 bottom-0 h-[85%] max-h-[560px] object-contain drop-shadow-2xl pointer-events-none select-none z-[5]"
      />
    </div>
  )
}
