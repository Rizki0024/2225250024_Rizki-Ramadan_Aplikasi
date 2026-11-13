-- =====================================================================
-- Belajar Kubus dan Balok — skema database Supabase (PostgreSQL)
-- Jalankan seluruh file ini di Supabase Dashboard → SQL Editor → Run.
-- Aman dijalankan ulang (idempotent).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. students — akun siswa (kode + PIN dibuat guru)
-- ---------------------------------------------------------------------
create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique check (code ~ '^[A-Z0-9-]{3,20}$'),
  pin_hash      text not null,                       -- bcrypt, bukan PIN asli
  nickname      text not null check (char_length(nickname) between 1 and 40),
  class_name    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------------------------------------------------------------------
-- 2. materials — materi pembelajaran (isi berupa blok JSON)
-- ---------------------------------------------------------------------
create table if not exists public.materials (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  shape        text not null check (shape in ('prasyarat','kubus','balok','soal-cerita')),
  order_no     int  not null,
  summary      text not null default '',
  content      jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. questions — bank soal evaluasi (berisi kunci jawaban → RAHASIA)
-- ---------------------------------------------------------------------
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,                  -- mis. EV-01
  usage       text not null default 'evaluasi' check (usage in ('evaluasi')),
  process     text not null check (process in ('formulate','employ','interpret')),
  shape       text not null check (shape in ('kubus','balok','campuran')),
  difficulty  smallint not null check (difficulty between 1 and 3),
  type        text not null check (type in ('mc','numeric')),
  prompt      text not null,
  options     jsonb,                                 -- [{id,label}] untuk 'mc'
  answer_key  text not null,                         -- id opsi atau angka
  unit        text,
  tolerance   numeric not null default 0,
  explanation jsonb not null,                        -- langkah pembahasan
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint mc_has_options check (type <> 'mc' or jsonb_array_length(options) >= 2)
);

-- ---------------------------------------------------------------------
-- 4. quiz_attempts — satu sesi latihan/evaluasi
-- ---------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  mode             text not null check (mode in ('latihan','evaluasi')),
  level            text,                             -- level latihan, null untuk evaluasi
  status           text not null default 'in_progress'
                   check (status in ('in_progress','submitted','expired')),
  question_order   jsonb not null default '[]'::jsonb, -- urutan soal & opsi acak
  started_at       timestamptz not null default now(),
  expires_at       timestamptz,
  submitted_at     timestamptz,
  duration_seconds int check (duration_seconds >= 0),
  total_questions  int not null check (total_questions > 0),
  correct_count    int check (correct_count >= 0),
  wrong_count      int check (wrong_count >= 0),
  score            numeric(5,2) check (score between 0 and 100),
  stars            smallint check (stars between 0 and 3),
  timed_out        boolean not null default false
);
create index if not exists quiz_attempts_student_idx
  on public.quiz_attempts (student_id, started_at desc);

-- ---------------------------------------------------------------------
-- 5. quiz_answers — jawaban per soal
-- ---------------------------------------------------------------------
create table if not exists public.quiz_answers (
  id                uuid primary key default gen_random_uuid(),
  attempt_id        uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id       uuid references public.questions(id) on delete set null, -- null untuk soal latihan acak
  question_snapshot jsonb,                           -- teks soal latihan yang dibangkitkan
  position          int not null,
  answer_text       text,                            -- null = tidak dijawab
  is_correct        boolean not null,
  answered_at       timestamptz not null default now()
);
create index if not exists quiz_answers_attempt_idx on public.quiz_answers (attempt_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Backend (FastAPI) memakai secret/service-role key yang MELEWATI RLS.
-- Peran anon & authenticated (kunci publik) ditutup rapat.
-- =====================================================================
alter table public.students      enable row level security;
alter table public.materials     enable row level security;
alter table public.questions     enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers  enable row level security;

-- Cabut hak bawaan dari kunci publik untuk tabel sensitif.
revoke all on public.students, public.questions, public.quiz_attempts, public.quiz_answers
  from anon, authenticated;
revoke insert, update, delete on public.materials from anon, authenticated;

-- materials: boleh dibaca publik bila diterbitkan (tidak rahasia).
drop policy if exists "materi terbit dapat dibaca" on public.materials;
create policy "materi terbit dapat dibaca" on public.materials
  for select to anon, authenticated using (is_published);

-- Kebijakan pemilik-data (pertahanan berlapis). Saat ini frontend tidak memakai
-- Supabase langsung; kebijakan ini berlaku bila kelak token Supabase berisi
-- klaim student_id. Tanpa GRANT, peran authenticated tetap tidak punya akses.
drop policy if exists "siswa melihat attempt sendiri" on public.quiz_attempts;
create policy "siswa melihat attempt sendiri" on public.quiz_attempts
  for select to authenticated
  using (student_id::text = (auth.jwt() ->> 'student_id'));

drop policy if exists "siswa melihat jawaban sendiri" on public.quiz_answers;
create policy "siswa melihat jawaban sendiri" on public.quiz_answers
  for select to authenticated
  using (exists (select 1 from public.quiz_attempts a
                 where a.id = attempt_id
                   and a.student_id::text = (auth.jwt() ->> 'student_id')));

-- students & questions: TANPA policy → tertutup untuk anon/authenticated.

-- =====================================================================
-- View rekap nilai untuk guru (dibuka dari Table Editor / SQL Editor)
-- =====================================================================
create or replace view public.rekap_nilai
with (security_invoker = true) as
select s.code, s.nickname, s.class_name, a.mode, a.level, a.score,
       a.correct_count, a.wrong_count, a.duration_seconds, a.started_at, a.submitted_at
from public.quiz_attempts a
join public.students s on s.id = a.student_id
where a.status = 'submitted'
order by a.submitted_at desc;
revoke all on public.rekap_nilai from anon, authenticated;
