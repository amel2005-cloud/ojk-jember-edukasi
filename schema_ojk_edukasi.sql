-- =========================================================
-- SKEMA DATABASE: Sistem Manajemen Edukasi OJK Jember
-- Target: Supabase (PostgreSQL) - Free Tier
-- =========================================================

-- ---------- ENUM STATUS ----------
create type status_pengajuan as enum (
  'draft', 'pending', 'diproses', 'revisi', 'approved', 'rejected', 'selesai'
);

create type peran_user as enum ('super_admin', 'admin', 'viewer', 'pengaju');

-- ---------- PROFILES (extend auth.users bawaan Supabase) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  role peran_user not null default 'pengaju',
  instansi_id uuid,
  created_at timestamptz default now()
);

-- ---------- INSTANSI (data pengaju) ----------
create table instansi (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  jenis text not null, -- Sekolah, Universitas, Desa, Kecamatan, Komunitas, Instansi Pemerintah, Perusahaan
  pic_nama text not null,
  pic_hp text not null,
  pic_email text not null,
  alamat text,
  kabupaten text,
  kecamatan text,
  desa text,
  created_at timestamptz default now()
);

alter table profiles
  add constraint fk_profiles_instansi
  foreign key (instansi_id) references instansi(id);

-- ---------- MATERI EDUKASI ----------
create table materi (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique
);

insert into materi (nama) values
  ('Literasi Keuangan'), ('Investasi'), ('Pinjaman Online'), ('Judi Online'),
  ('Perbankan'), ('Pasar Modal'), ('Asuransi'), ('Keuangan Syariah'),
  ('Perlindungan Konsumen'), ('Lainnya');

-- ---------- NARASUMBER ----------
create table narasumber (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  bidang_keahlian text,
  kontak text,
  created_at timestamptz default now()
);

-- ---------- PENGAJUAN (tabel inti) ----------
create table pengajuan (
  id uuid primary key default gen_random_uuid(),
  nomor_urut serial,                       -- untuk kode "Pengajuan #0012"
  instansi_id uuid references instansi(id) not null,
  tanggal_pilihan_1 date not null,
  tanggal_pilihan_2 date,
  tanggal_pilihan_3 date,
  tanggal_final date,
  jam_final time,
  jumlah_peserta int,
  target_peserta text,
  lokasi_kegiatan text,
  catatan text,
  surat_permohonan_url text,               -- Supabase Storage path
  surat_balasan_url text,
  narasumber_id uuid references narasumber(id),
  status status_pengajuan not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- RELASI PENGAJUAN <-> MATERI (many-to-many) ----------
create table pengajuan_materi (
  pengajuan_id uuid references pengajuan(id) on delete cascade,
  materi_id uuid references materi(id),
  primary key (pengajuan_id, materi_id)
);

-- ---------- LOG PERUBAHAN STATUS (untuk tracking & SLA) ----------
create table status_log (
  id uuid primary key default gen_random_uuid(),
  pengajuan_id uuid references pengajuan(id) on delete cascade,
  status status_pengajuan not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz default now(),
  keterangan text
);

-- ---------- INDEX untuk performa filter & dashboard ----------
create index idx_pengajuan_status on pengajuan(status);
create index idx_pengajuan_tanggal_final on pengajuan(tanggal_final);
create index idx_instansi_kabupaten on instansi(kabupaten);
create index idx_status_log_pengajuan on status_log(pengajuan_id);

-- ---------- VIEW: Kalender Publik (hanya yang approved/selesai) ----------
create view v_kalender_publik as
select
  p.id,
  p.tanggal_final,
  p.jam_final,
  i.nama as nama_instansi,
  p.lokasi_kegiatan,
  p.status,
  string_agg(m.nama, ', ') as materi
from pengajuan p
join instansi i on i.id = p.instansi_id
left join pengajuan_materi pm on pm.pengajuan_id = p.id
left join materi m on m.id = pm.materi_id
where p.status in ('approved', 'selesai')
group by p.id, i.nama;

-- ---------- VIEW: Statistik Dashboard Admin ----------
create view v_stat_ringkasan as
select
  count(*) filter (where status = 'pending')  as total_pending,
  count(*) filter (where status = 'diproses') as total_diproses,
  count(*) filter (where status = 'approved') as total_approved,
  count(*) filter (where status = 'rejected') as total_rejected,
  count(*) filter (where status = 'selesai')  as total_selesai,
  count(*) as total_semua
from pengajuan;

-- ---------- ROW LEVEL SECURITY (RLS) ----------
alter table pengajuan enable row level security;
alter table instansi enable row level security;

-- Admin & super_admin bisa akses semua pengajuan
create policy admin_full_access on pengajuan
  for all
  using (
    exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role in ('admin','super_admin'))
  );

-- Pengaju hanya bisa lihat pengajuan milik instansinya sendiri
create policy pengaju_lihat_sendiri on pengajuan
  for select
  using (
    instansi_id = (select instansi_id from profiles where id = auth.uid())
  );

-- Publik (anon) hanya boleh baca lewat view v_kalender_publik, bukan tabel pengajuan langsung
