import { useState } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AdminPengajuan from './pages/AdminPengajuan'
import PengajuanForm from './pages/PengajuanForm'
import Riwayat from './pages/Riwayat'
import MateriUnduhan from './pages/MateriUnduhan'
import AdminLaporan from './pages/AdminLaporan'
import PublicCalendar from './pages/PublicCalendar'
import Sidebar from './components/Sidebar'

// Tahap 1: routing sederhana berbasis state (belum pakai react-router).
// Bisa diganti react-router-dom nanti kalau halaman sudah banyak.
export default function App() {
  const [screen, setScreen] = useState('landing') // landing | login | admin | pengaju | public
  const [adminPage, setAdminPage] = useState('dashboard')
  const [pengajuPage, setPengajuPage] = useState('form')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogin(role) {
    setScreen(role) // 'admin' atau 'pengaju'
  }

  if (screen === 'landing') {
    return (
      <Landing
        onEnterSystem={() => setScreen('login')}
        onShowPublic={() => setScreen('public')}
      />
    )
  }

  if (screen === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onShowPublic={() => setScreen('public')}
        onShowRegister={() => setScreen('register')}
      />
    )
  }

  if (screen === 'register') {
    return (
      <Register
        onRegistered={() => setScreen('login')}
        onBackToLogin={() => setScreen('login')}
      />
    )
  }

  if (screen === 'public') {
    return <PublicCalendar onShowLogin={() => setScreen('login')} />
  }

  if (screen === 'admin') {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          role="admin"
          active={adminPage}
          onNavigate={(key) => (key === 'public' ? setScreen('public') : setAdminPage(key))}
          onLogout={() => setScreen('login')}
          currentUserLabel="Admin OJK"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileTopbar onOpenMenu={() => setSidebarOpen(true)} />
          {adminPage === 'dashboard' && <AdminDashboard />}
          {adminPage === 'pengajuan' && <AdminPengajuan />}
          {adminPage === 'materi-edukasi' && <MateriUnduhan isAdmin />}
        
          {adminPage === 'laporan' && <AdminLaporan />}
        </div>
      </div>
    )
  }

  if (screen === 'pengaju') {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          role="pengaju"
          active={pengajuPage}
          onNavigate={(key) => (key === 'public' ? setScreen('public') : setPengajuPage(key))}
          onLogout={() => setScreen('login')}
          currentUserLabel="Pengaju"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileTopbar onOpenMenu={() => setSidebarOpen(true)} />
          {pengajuPage === 'form' && <PengajuanForm />}
          {pengajuPage === 'riwayat' && <Riwayat />}
          {pengajuPage === 'materi-edukasi' && <MateriUnduhan isAdmin={false} />}
        </div>
      </div>
    )
  }

  return null
}

function MobileTopbar({ onOpenMenu }) {
  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e3e8f0] sticky top-0 z-20">
      <button onClick={onOpenMenu} className="text-navy-900 text-xl px-1" aria-label="Buka menu">
        ☰
      </button>
      <span className="font-black text-navy-950">OJK Jember</span>
    </div>
  )
}

