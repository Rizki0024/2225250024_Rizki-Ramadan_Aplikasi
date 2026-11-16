-- Migrasi: soal evaluasi bertahap (kisi-kisi Mathematical Literacy, 4 indikator, skor per tahap).
-- AMAN: hanya MENAMBAH kolom dan MELONGGARKAN dua batasan (check). Tidak ada tabel/baris yang dihapus,
-- data siswa, percobaan, dan jawaban lama tidak diubah. Boleh dijalankan lebih dari sekali.
-- Cara: Supabase Dashboard → SQL Editor → New query → tempel seluruh isi file ini → Run.

begin;

-- 1) Kolom baru untuk soal bertahap.
alter table public.questions add column if not exists title      text;
alter table public.questions add column if not exists indicator  text;
alter table public.questions add column if not exists stages     jsonb;    -- tahap + kunci + pembahasan (tidak dikirim ke siswa sebelum dikumpulkan)
alter table public.questions add column if not exists max_points numeric;

-- 2) Izinkan indikator 'reasoning' dan jenis soal 'staged' (hapus batasan lama, buat batasan baru yang lebih luas).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.questions'::regclass and contype = 'c'
      and (pg_get_constraintdef(oid) ilike '%process%' or pg_get_constraintdef(oid) ilike '%type%')
      and pg_get_constraintdef(oid) not ilike '%difficulty%'
  loop
    execute format('alter table public.questions drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.questions add constraint questions_process_check
  check (process in ('reasoning','formulate','employ','interpret'));
alter table public.questions add constraint questions_type_check
  check (type in ('mc','numeric','staged'));

-- 3) Soal bertahap wajib punya tahap.
alter table public.questions drop constraint if exists questions_staged_has_stages;
alter table public.questions add constraint questions_staged_has_stages
  check (type <> 'staged' or (stages is not null and jsonb_typeof(stages) = 'array'));

commit;

-- Setelah ini jalankan dari folder backend:  python scripts/seed_supabase.py
-- (mengisi 4 soal ML-1..ML-4 dan menonaktifkan 10 soal lama EV-01..EV-10 tanpa menghapusnya).
