import { useState, useEffect } from 'react'

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
import AdminKalender from './pages/AdminKalender'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [adminPage, setAdminPage] = useState('dashboard')
  const [pengajuPage, setPengajuPage] = useState('form')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Menyiapkan riwayat navigasi browser
  useEffect(() => {
    const initialState = {
      ojkEdukasi: true,
      screen: 'landing',
      adminPage: 'dashboard',
      pengajuPage: 'form',
    }

    window.history.replaceState(initialState, '', window.location.href)

    function handlePopState(event) {
      const state = event.state

      if (state?.ojkEdukasi) {
        setScreen(state.screen || 'landing')
        setAdminPage(state.adminPage || 'dashboard')
        setPengajuPage(state.pengajuPage || 'form')
      }

      setSidebarOpen(false)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Navigasi sekaligus menyimpan halaman ke riwayat browser
  function navigate(changes = {}) {
    const nextState = {
      ojkEdukasi: true,
      screen,
      adminPage,
      pengajuPage,
      ...changes,
    }

    window.history.pushState(nextState, '', window.location.href)

    setScreen(nextState.screen)
    setAdminPage(nextState.adminPage)
    setPengajuPage(nextState.pengajuPage)
    setSidebarOpen(false)
  }

  function handleLogin(role) {
    navigate({ screen: role })
  }

  function handleLogout() {
    const nextState = {
      ojkEdukasi: true,
      screen: 'login',
      adminPage: 'dashboard',
      pengajuPage: 'form',
    }

    window.history.replaceState(nextState, '', window.location.href)

    setScreen('login')
    setAdminPage('dashboard')
    setPengajuPage('form')
    setSidebarOpen(false)
  }

  if (screen === 'landing') {
    return (
      <Landing
        onEnterSystem={() => navigate({ screen: 'login' })}
        onShowPublic={() => navigate({ screen: 'public' })}
      />
    )
  }

  if (screen === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onShowPublic={() => navigate({ screen: 'public' })}
        onShowRegister={() => navigate({ screen: 'register' })}
      />
    )
  }

  if (screen === 'register') {
    return (
      <Register
        onRegistered={() => navigate({ screen: 'login' })}
        onBackToLogin={() => navigate({ screen: 'login' })}
      />
    )
  }

  if (screen === 'public') {
    return <PublicCalendar onShowLogin={() => navigate({ screen: 'login' })} />
  }

  if (screen === 'admin') {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          role="admin"
          active={adminPage}
          onNavigate={(key) => navigate({ adminPage: key })}
          onLogout={handleLogout}
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
          {adminPage === 'public' && <AdminKalender />}
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
          onNavigate={(key) =>
            key === 'public'
              ? navigate({ screen: 'public' })
              : navigate({ pengajuPage: key })
          }
          onLogout={handleLogout}
          currentUserLabel="Pengaju"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <MobileTopbar onOpenMenu={() => setSidebarOpen(true)} />

          {pengajuPage === 'form' && <PengajuanForm />}
{pengajuPage === 'riwayat' && <Riwayat />}
        </div>
      </div>
    )
  }

  return null
}

function MobileTopbar({ onOpenMenu }) {
  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e3e8f0] sticky top-0 z-20">
      <button
        onClick={onOpenMenu}
        className="text-navy-900 text-xl px-1"
        aria-label="Buka menu"
      >
        ☰
      </button>

      <span className="font-black text-navy-950">OJK Jember</span>
    </div>
  )
}
