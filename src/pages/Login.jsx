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
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,5,7,0.55), rgba(92,15,24,0.65)), url('/images/login-bg.jpg')",
      }}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center text-white px-6"></div>
      <div className="w-full max-w-[400px] mt-51 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="flex justify-center mb-6">
          <Logo size={40} />
        </div>
        <h2 className="text-2xl mb-1 text-center">Masuk</h2>
        <p className="text-sm text-[#5b6472] mb-7 text-center">
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
          className="block text-center mt-3 text-sm text-navy-700 font-semibold cursor-pointer"
        >
          Belum punya akun? Daftar sebagai Pengaju →
        </a>
        <a
          onClick={onShowPublic}
          className="block text-center mt-3 text-sm text-navy-700 font-semibold cursor-pointer"
        >
          Lihat kalender publik tanpa login →
        </a>
      </div>
    </div>
  )
}
