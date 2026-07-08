import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import Logo from '../components/Logo'

export default function Login({ onLogin, onShowPublic, onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!isSupabaseConfigured) {
      onLogin('admin')
      return
    }
    setLoading(true)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, nama')
      .eq('id', authData.user.id)
      .single()

    setLoading(false)

    if (profileError || !profile) {
      setError(
        'Akun ini belum terdaftar sebagai pengaju maupun admin. Hubungi admin OJK Jember untuk penautan akun.'
      )
      await supabase.auth.signOut()
      return
    }

    const roleGroup = ['admin', 'super_admin', 'viewer'].includes(profile.role)
      ? 'admin'
      : 'pengaju'
    onLogin(roleGroup)
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel kiri */}
      <div
        className="flex-[1.1] text-white p-14 flex flex-col justify-between relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/login-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/45"></div>

        <div className="relative z-10">
          <Logo size={34} light />
          <div className="text-[13px] text-[#f3d9dc] uppercase tracking-widest mt-2">
            Sistem Manajemen Edukasi Keuangan
          </div>
        </div>

        <div className="max-w-md text-2xl font-bold leading-snug relative z-10">
          Satu pintu untuk pengajuan, verifikasi, dan penjadwalan edukasi
        keuangan di wilayah kerja Kantor Jember.
          <small className="block mt-3 font-normal text-sm text-[#aebede] font-sans">
            Role Admin / Pengaju ditentukan otomatis dari akun kamu.
          </small>
        </div>
      </div>

      {/* Panel kanan */}
      <div className="flex-1 flex items-center justify-center bg-white"></div>
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-[360px]">
          <h2 className="text-2xl mb-1">Masuk</h2>
          <p className="text-sm text-[#5b6472] mb-7">
            Gunakan akun yang sudah terdaftar di sistem.
          </p>
          <div className="mb-4">
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
              Email
            </label>
            <input
              className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">
              Kata sandi
            </label>
            <input
              type="password"
              className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm disabled:opacity-60"
          >
            {loading ? 'Memeriksa akun...' : 'Masuk'}
          </button>
          <p className="text-xs text-[#5b6472] mt-4 text-center">
            {isSupabaseConfigured
              ? 'Terhubung ke Supabase Auth.'
              : 'Mode demo — belum tersambung Supabase.'}
          </p>
          <a
            onClick={onShowRegister}
            className="block text-center mt-3 text-sm text-[#1d5dad] font-semibold cursor-pointer"
          >
            Belum punya akun? Daftar sebagai Pengaju →
          </a>
          <a
            onClick={onShowPublic}
            className="block text-center mt-3 text-sm text-[#1d5dad] font-semibold cursor-pointer"
          >
            Lihat kalender publik tanpa login →
          </a>
        </div>
      </div>
    </div>
  )
}
