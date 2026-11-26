
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
      className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/login-bg.jpg')",
      }}
    >
      {/* Overlay vintage dark cinematic */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            linear-gradient(
              100deg,
              rgba(20, 14, 10, 0.86) 0%,
              rgba(30, 21, 14, 0.74) 43%,
              rgba(45, 32, 21, 0.58) 72%,
              rgba(60, 43, 28, 0.48) 100%
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mt-8 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-5 md:p-6">
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
            ? ''
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
