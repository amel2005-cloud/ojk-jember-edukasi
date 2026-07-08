# Sistem Manajemen Edukasi OJK Jember

Project React + Vite + Tailwind + Supabase, sesuai roadmap Tahap 1–2.

## 1. Buka di VS Code
Extract folder ini, lalu `File > Open Folder` di VS Code, arahkan ke folder `ojk-edukasi`.

## 2. Install dependency
Buka terminal di VS Code (`` Ctrl+` ``), lalu jalankan:
```
npm install
```

## 3. Sambungkan ke Supabase
1. Jalankan `schema_ojk_edukasi.sql` di Supabase SQL Editor (kalau belum).
2. Copy `.env.example` jadi `.env.local`:
   ```
   cp .env.example .env.local
   ```
3. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari Supabase Dashboard → Project Settings → API.

> Kalau `.env.local` belum diisi, aplikasi tetap jalan pakai **data dummy** (mode demo) — jadi tampilan tetap bisa dicoba dari awal.

## 4. Jalankan
```
npm run dev
```
Buka `http://localhost:5173`.

## 5. Deploy ke Vercel (gratis)
1. Push folder ini ke GitHub.
2. Import repo di https://vercel.com/new
3. Tambahkan environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di pengaturan project Vercel.
4. Deploy — dapat URL `namaproyek.vercel.app`.

## Struktur folder
```
src/
  App.jsx                 -> routing sederhana (login/admin/pengaju/public)
  supabaseClient.js        -> koneksi Supabase (fallback demo kalau .env kosong)
  data/dummy.js             -> data contoh untuk mode demo
  components/               -> Sidebar, StatCard, Stepper (dipakai berulang)
  pages/
    Login.jsx
    AdminDashboard.jsx
    PengajuanForm.jsx
    PublicCalendar.jsx
```

## Progres roadmap
- [x] Tahap 1: UI/UX, Database (schema.sql), Login, Dashboard
- [ ] Tahap 2: Form Pengajuan tersambung penuh + Approval admin + Kalender publik live
- [ ] Tahap 3: Statistik lanjutan, Export PDF/Excel, Notifikasi email
- [ ] Tahap 4: QR presensi, survei kepuasan, sertifikat otomatis
