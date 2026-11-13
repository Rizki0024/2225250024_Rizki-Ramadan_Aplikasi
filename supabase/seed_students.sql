-- =====================================================================
-- Contoh pembuatan akun siswa (jalankan di Supabase SQL Editor).
-- GANTI kode, PIN, dan nama samaran sebelum dipakai di kelas.
-- PIN di-hash dengan bcrypt melalui pgcrypto; PIN asli tidak tersimpan.
-- Bagikan kode + PIN kepada siswa secara pribadi (kertas/kartu).
-- =====================================================================
insert into public.students (code, pin_hash, nickname, class_name) values
  ('KB-001', extensions.crypt('1234', extensions.gen_salt('bf')), 'Elang',   'VIII-A'),
  ('KB-002', extensions.crypt('2345', extensions.gen_salt('bf')), 'Merpati', 'VIII-A'),
  ('KB-003', extensions.crypt('3456', extensions.gen_salt('bf')), 'Rajawali','VIII-A')
on conflict (code) do nothing;

-- Mengganti PIN seorang siswa:
-- update public.students set pin_hash = extensions.crypt('9876', extensions.gen_salt('bf'))
-- where code = 'KB-001';

-- Menonaktifkan siswa:
-- update public.students set is_active = false where code = 'KB-003';
