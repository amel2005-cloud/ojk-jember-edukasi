import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AdminPengajuan from './pages/AdminPengajuan'
import PengajuanForm from './pages/PengajuanForm'
import Riwayat from './pages/Riwayat'
import MateriUnduhan from './pages/MateriUnduhan'
import AdminNarasumber from './pages/AdminNarasumber'
import AdminLaporan from './pages/AdminLaporan'
import PublicCalendar from './pages/PublicCalendar'
import Sidebar from './components/Sidebar'

// Tahap 1: routing sederhana berbasis state (belum pakai react-router).
// Bisa diganti react-router-dom nanti kalau halaman sudah banyak.
export default function App() {
  const [screen, setScreen] = useState('login') // login | admin | pengaju | public
  const [adminPage, setAdminPage] = useState('dashboard')
  const [pengajuPage, setPengajuPage] = useState('form')

  function handleLogin(role) {
    setScreen(role) // 'admin' atau 'pengaju'
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
        />
        {adminPage === 'dashboard' && <AdminDashboard />}
        {adminPage === 'pengajuan' && <AdminPengajuan />}
        {adminPage === 'materi-edukasi' && <MateriUnduhan isAdmin />}
        {adminPage === 'narasumber' && <AdminNarasumber />}
        {adminPage === 'laporan' && <AdminLaporan />}
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
        />
        {pengajuPage === 'form' && <PengajuanForm />}
        {pengajuPage === 'riwayat' && <Riwayat />}
        {pengajuPage === 'materi-edukasi' && <MateriUnduhan isAdmin={false} />}
      </div>
    )
  }

  return null
}
