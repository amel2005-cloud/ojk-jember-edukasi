
import Logo from './Logo'
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  FileText,
  CalendarDays,
  ClipboardList,
  LogOut,
  X,
} from 'lucide-react'

export default function Sidebar({
  role,
  active,
  onNavigate,
  onLogout,
  currentUserLabel,
  open,
  onClose
}) {
  const menuAdmin = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'pengajuan', label: 'Pengajuan Kegiatan', icon: FolderOpen },
    { key: 'materi-edukasi', label: 'Materi Edukasi', icon: BookOpen },
    { key: 'laporan', label: 'Laporan Kegiatan', icon: FileText },
    { key: 'public', label: 'Kalender Publik', icon: CalendarDays },
  ]

  const menuPengaju = [
    { key: 'form', label: 'Ajukan Kegiatan', icon: ClipboardList },
    { key: 'riwayat', label: 'Riwayat Pengajuan', icon: FolderOpen },
    { key: 'materi-edukasi', label: 'Materi Edukasi', icon: BookOpen },
    { key: 'public', label: 'Kalender Publik', icon: CalendarDays },
  ]

  const items = role === 'admin' ? menuAdmin : menuPengaju

  function handleNavigate(key) {
    onNavigate(key)
    onClose?.()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          w-[236px] bg-navy-950 text-[#e7edf7] p-4 flex flex-col flex-shrink-0 min-h-screen
          fixed inset-y-0 left-0 z-40 transition-transform duration-200
          md:sticky md:top-0 md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
          <Logo size={30} light />

          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Menu Utama
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  text-left text-sm transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-[#17283F] font-semibold shadow-sm'
                      : 'text-[#e9d7da] hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? 'text-[#92283A]' : 'text-white/65'}
                />

                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Masuk sebagai
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {currentUserLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#e9d7da] hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  )
}
