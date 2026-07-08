import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import Logo from '../components/Logo'

export default function Register({ onRegistered, onBackToLogin }) {
  const [form, setForm] = useState({
    nama_instansi: '', jenis_instansi: 'Sekolah', pic_nama: '',
    pic_hp: '', alamat: '', kabupaten: 'Jember', kecamatan: '', desa: '',
    email: '', password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleRegister() {
    setError('')
    if (!isSupabaseConfigured) {
      setError('Mode demo — sambungkan Supabase dulu di .env.local untuk mendaftar akun sungguhan.')
      return
    }
    if (!form.email || !form.password || !form.nama_instansi) {
      setError('Nama instansi, email, dan kata sandi wajib diisi.')
      return
    }
    setLoading(true)

    // 1. Buat akun auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Pastikan sesi benar-benar aktif (kadang signUp belum langsung set sesi
    // walau "Confirm email" sudah dimatikan) — login ulang secara eksplisit.
    let userId = signUpData.user?.id
    if (!signUpData.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) {
        setError(
          'Akun dibuat, tapi belum bisa login otomatis (' + signInError.message +
          '). Kemungkinan email masih perlu dikonfirmasi — cek pengaturan "Confirm email" di Supabase Auth.'
        )
        setLoading(false)
        return
      }
      userId = signInData.user?.id
    }
    if (!userId) {
      setError('Pendaftaran perlu konfirmasi email dulu. Cek inbox kamu, lalu login setelah dikonfirmasi.')
      setLoading(false)
      return
    }

    // 2. Buat data instansi
    const { data: instansi, error: instansiError } = await supabase
      .from('instansi')
      .insert({
        nama: form.nama_instansi, jenis: form.jenis_instansi,
        pic_nama: form.pic_nama, pic_hp: form.pic_hp, pic_email: form.email,
        alamat: form.alamat, kabupaten: form.kabupaten, kecamatan: form.kecamatan, desa: form.desa,
      })
      .select()
      .single()
    if (instansiError) {
      setError('Gagal menyimpan data instansi: ' + instansiError.message)
      setLoading(false)
      return
    }

    // 3. Buat profil, tautkan role pengaju + instansi_id
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, nama: form.pic_nama || form.nama_instansi, role: 'pengaju', instansi_id: instansi.id })
    if (profileError) {
      setError('Gagal menyimpan profil akun: ' + profileError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onRegistered()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fa] p-6">
      <div className="w-full max-w-[420px] card">
        <div className="mb-5">
          <Logo size={30} />
        </div>
        <h2 className="text-2xl mb-1">Daftar Akun Pengaju</h2>
        <p className="text-sm text-[#5b6472] mb-6">Buat akun untuk instansi/lembaga yang akan mengajukan kegiatan edukasi.</p>

        <div className="space-y-3.5">
          <Field label="Nama Instansi" value={form.nama_instansi} onChange={(v) => set('nama_instansi', v)} />
          <div>
            <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">Jenis Instansi</label>
            <select
              value={form.jenis_instansi}
              onChange={(e) => set('jenis_instansi', e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
            >
              <option value="Sekolah">Sekolah</option>
              <option value="Universitas">Universitas</option>
              <option value="Komunitas">Komunitas</option>
              <option value="Umum/Lainnya">Umum/Lainnya</option>
            </select>
          </div>
          <Field label="Nama PIC" value={form.pic_nama} onChange={(v) => set('pic_nama', v)} />
          <Field label="Nomor HP PIC" value={form.pic_hp} onChange={(v) => set('pic_hp', v)} placeholder="08xx-xxxx-xxxx" />
          <Field label="Alamat" value={form.alamat} onChange={(v) => set('alamat', v)} placeholder="Jalan, nomor, RT/RW" />
          <Field label="Kabupaten" value={form.kabupaten} onChange={(v) => set('kabupaten', v)} />
          <Field label="Kecamatan" value={form.kecamatan} onChange={(v) => set('kecamatan', v)} />
          <Field label="Desa/Kelurahan" value={form.desa} onChange={(v) => set('desa', v)} />
          <Field label="Email (untuk login)" type="email" value={form.email} onChange={(v) => set('email', v)} />
          <Field label="Kata Sandi" type="password" value={form.password} onChange={(v) => set('password', v)} />
        </div>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-5 py-3 rounded-lg bg-navy-900 hover:bg-navy-700 text-white font-bold text-sm disabled:opacity-60"
        >
          {loading ? 'Mendaftarkan...' : 'Daftar'}
        </button>
        <a onClick={onBackToLogin} className="block text-center mt-4 text-sm text-[#1d5dad] font-semibold cursor-pointer">
          Sudah punya akun? Masuk →
        </a>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-[#5b6472] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#e3e8f0] rounded-lg text-sm"
      />
    </div>
  )
}
