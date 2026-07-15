import Logo from '../components/Logo'

export default function Landing({ onEnterSystem, onShowPublic }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative overflow-hidden flex flex-col"
      style={{
        backgroundImage:
          "linear-gradient(100deg, rgba(20,6,9,0.55) 0%, rgba(20,6,9,0.15) 55%, rgba(20,6,9,0) 75%), url('/images/login-bg.jpg')",
      }}
    >
      <div className="p-6 md:p-8">
        <Logo size={34} />
      </div>

      <div className="flex-1 flex items-center px-6 md:px-16 pb-16 md:pb-0">
        <div className="max-w-xl">
          <p className="text-white/90 font-medium text-sm md:text-base mb-1">
            Selamat Datang di
          </p>
          <h1
            className="text-white text-6xl md:text-7xl font-extrabold tracking-tight mb-3 drop-shadow-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            JARI
          </h1>
          <h2 className="text-white font-bold text-xl md:text-2xl leading-snug mb-3">
            Jember Administrasi, Registrasi, dan Informasi Edukasi Keuangan
          </h2>
          <div className="w-14 h-1 bg-navy-700 rounded-full mb-4" />
          <p className="text-white/85 text-sm md:text-base mb-8 max-w-md">
            Platform layanan administrasi dan edukasi keuangan yang terpercaya,
            transparan, dan mudah diakses.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={onEnterSystem}
              className="px-6 py-3.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              ⇾ Masuk ke Sistem
            </button>
            <button
              onClick={onShowPublic}
              className="px-6 py-3.5 rounded-lg bg-white/95 hover:bg-white text-navy-900 font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              ⛊ Lihat Kalender Publik
            </button>
          </div>

          <p className="text-white/75 text-xs flex items-center gap-1.5">
            Sistem aman dan terpercaya — data Anda terlindungi dengan standar
            keamanan tinggi.
          </p>
        </div>
      </div>

      <img
        src="/images/jun.png"
        alt=""
        className="hidden md:block absolute right-6 lg:right-16 bottom-0 h-[85%] max-h-[560px] object-contain drop-shadow-2xl pointer-events-none select-none"
      />
    </div>
  )
}
