-- VikingShot: contas, salvamento na nuvem e ranking
-- Rode uma vez no Supabase: SQL Editor -> New query -> colar -> Run

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  jarl text not null default 'Jarl' check (char_length(jarl) between 2 and 18),
  vila text not null default 'Vila do Jarl' check (char_length(vila) between 2 and 24),
  power int not null default 0 check (power between 0 and 200000),
  best_wave int not null default 0 check (best_wave between 0 and 30),
  updated_at timestamptz not null default now()
);

create table if not exists public.saves (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null check (pg_column_size(data) < 200000),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;

-- ranking é público; cada um só mexe no próprio perfil
drop policy if exists "ranking publico" on public.profiles;
create policy "ranking publico" on public.profiles for select using (true);
drop policy if exists "cria o proprio perfil" on public.profiles;
create policy "cria o proprio perfil" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "atualiza o proprio perfil" on public.profiles;
create policy "atualiza o proprio perfil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- o save é privado
drop policy if exists "le o proprio save" on public.saves;
create policy "le o proprio save" on public.saves for select using (auth.uid() = user_id);
drop policy if exists "cria o proprio save" on public.saves;
create policy "cria o proprio save" on public.saves for insert with check (auth.uid() = user_id);
drop policy if exists "atualiza o proprio save" on public.saves;
create policy "atualiza o proprio save" on public.saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists profiles_power on public.profiles (power desc);
create index if not exists profiles_wave on public.profiles (best_wave desc, power desc);

-- Ranking dos eventos semanais (rode uma vez)
create table if not exists public.event_scores (
  week int not null,
  user_id uuid not null references auth.users on delete cascade,
  jarl text not null default 'Jarl' check (char_length(jarl) between 1 and 18),
  pts int not null default 0 check (pts between 0 and 1000000),
  primary key (week, user_id)
);
alter table public.event_scores enable row level security;
drop policy if exists "ranking do evento publico" on public.event_scores;
create policy "ranking do evento publico" on public.event_scores for select using (true);
drop policy if exists "cria os proprios pontos" on public.event_scores;
create policy "cria os proprios pontos" on public.event_scores for insert with check (auth.uid() = user_id);
drop policy if exists "atualiza os proprios pontos" on public.event_scores;
create policy "atualiza os proprios pontos" on public.event_scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists event_scores_week on public.event_scores (week, pts desc);
