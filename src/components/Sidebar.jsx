import Logo from './Logo'

export default function Sidebar({ role, active, onNavigate, onLogout, currentUserLabel }) {
  const menuAdmin = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'pengajuan', label: '🗂️ Pengajuan' },
    { key: 'narasumber', label: '🎙️ Narasumber' },
    { key: 'materi-edukasi', label: '📥 Materi Edukasi' },
    { key: 'laporan', label: '📄 Laporan' },
    { key: 'public', label: '🌐 Kalender Publik' },
  ]
  const menuPengaju = [
    { key: 'form', label: '📝 Ajukan Kegiatan' },
    { key: 'riwayat', label: '📋 Riwayat Pengajuan' },
    { key: 'materi-edukasi', label: '📥 Materi Edukasi' },
    { key: 'public', label: '🌐 Kalender Publik' },
  ]
  const items = role === 'admin' ? menuAdmin : menuPengaju

  return (
    <div className="w-[236px] bg-navy-950 text-[#e7edf7] p-4 flex flex-col flex-shrink-0 min-h-screen">
      <div className="pb-5 mb-4 border-b border-white/10">
        <Logo size={30} light />
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer mb-0.5 ${
            active === item.key
              ? 'bg-white text-navy-900 font-bold'
              : 'text-[#e9d7da] hover:bg-white/5'
          }`}
        >
          {item.label}
        </div>
      ))}
      <div className="mt-auto pt-3 border-t border-white/10 text-xs text-[#d9b3ba]">
        Masuk sebagai <b className="text-white">{currentUserLabel}</b>
        <br />
        <span className="text-[#f3c7bd] font-semibold cursor-pointer" onClick={onLogout}>
          ← Keluar
        </span>
      </div>
    </div>
  )
}
