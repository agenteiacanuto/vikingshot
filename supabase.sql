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

-- Arena: equipe de defesa de cada jogador (rode uma vez)
create table if not exists public.arena (
  user_id uuid primary key references auth.users on delete cascade,
  jarl text not null default 'Jarl' check (char_length(jarl) between 1 and 18),
  rating int not null default 1000 check (rating between 0 and 100000),
  power int not null default 0,
  snap jsonb not null check (pg_column_size(snap) < 20000),
  updated_at timestamptz not null default now()
);
alter table public.arena enable row level security;
drop policy if exists "arena publica" on public.arena;
create policy "arena publica" on public.arena for select using (true);
drop policy if exists "cria a propria arena" on public.arena;
create policy "cria a propria arena" on public.arena for insert with check (auth.uid() = user_id);
drop policy if exists "atualiza a propria arena" on public.arena;
create policy "atualiza a propria arena" on public.arena for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists arena_rating on public.arena (rating);

-- ===== v20: ranking da Torre e Clãs (rode uma vez) =====
create table if not exists public.tower (
  user_id uuid primary key references auth.users on delete cascade,
  jarl text not null default 'Jarl' check (char_length(jarl) between 1 and 18),
  best int not null default 0 check (best between 0 and 100000),
  updated_at timestamptz not null default now()
);
alter table public.tower enable row level security;
drop policy if exists "torre publica" on public.tower;
create policy "torre publica" on public.tower for select using (true);
drop policy if exists "cria a propria torre" on public.tower;
create policy "cria a propria torre" on public.tower for insert with check (auth.uid() = user_id);
drop policy if exists "atualiza a propria torre" on public.tower;
create policy "atualiza a propria torre" on public.tower for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists tower_best on public.tower (best desc);

create table if not exists public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 3 and 20),
  tag text not null check (char_length(tag) between 2 and 4),
  descr text not null default '' check (char_length(descr) <= 60),
  leader uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.clan_members (
  user_id uuid primary key references auth.users on delete cascade,
  clan_id uuid not null references public.clans on delete cascade,
  jarl text not null default 'Jarl' check (char_length(jarl) between 1 and 18),
  power int not null default 0,
  role text not null default 'membro',
  joined_at timestamptz not null default now()
);
create table if not exists public.clan_chat (
  id bigint generated always as identity primary key,
  clan_id uuid not null references public.clans on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  jarl text not null check (char_length(jarl) between 1 and 18),
  msg text not null check (char_length(msg) between 1 and 200),
  created_at timestamptz not null default now()
);
create table if not exists public.clan_boss (
  week int not null,
  user_id uuid not null references auth.users on delete cascade,
  clan_id uuid not null references public.clans on delete cascade,
  dmg bigint not null default 0 check (dmg between 0 and 50000000),
  primary key (week, user_id)
);
create index if not exists clan_members_clan on public.clan_members (clan_id);
create index if not exists clan_chat_clan on public.clan_chat (clan_id, created_at desc);
create index if not exists clan_boss_clan on public.clan_boss (week, clan_id);

alter table public.clans enable row level security;
alter table public.clan_members enable row level security;
alter table public.clan_chat enable row level security;
alter table public.clan_boss enable row level security;

drop policy if exists "clans publicos" on public.clans;
create policy "clans publicos" on public.clans for select using (true);
drop policy if exists "cria clan" on public.clans;
create policy "cria clan" on public.clans for insert with check (auth.uid() = leader);
drop policy if exists "lider edita clan" on public.clans;
create policy "lider edita clan" on public.clans for update using (auth.uid() = leader);
drop policy if exists "lider apaga clan" on public.clans;
create policy "lider apaga clan" on public.clans for delete using (auth.uid() = leader);

drop policy if exists "membros publicos" on public.clan_members;
create policy "membros publicos" on public.clan_members for select using (true);
drop policy if exists "entra no clan" on public.clan_members;
create policy "entra no clan" on public.clan_members for insert with check (auth.uid() = user_id);
drop policy if exists "atualiza o proprio membro" on public.clan_members;
create policy "atualiza o proprio membro" on public.clan_members for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "sai do clan" on public.clan_members;
create policy "sai do clan" on public.clan_members for delete using (auth.uid() = user_id);

drop policy if exists "chat so do clan" on public.clan_chat;
create policy "chat so do clan" on public.clan_chat for select using (exists (select 1 from public.clan_members m where m.user_id = auth.uid() and m.clan_id = clan_chat.clan_id));
drop policy if exists "escreve no chat do clan" on public.clan_chat;
create policy "escreve no chat do clan" on public.clan_chat for insert with check (auth.uid() = user_id and exists (select 1 from public.clan_members m where m.user_id = auth.uid() and m.clan_id = clan_chat.clan_id));

drop policy if exists "dano publico" on public.clan_boss;
create policy "dano publico" on public.clan_boss for select using (true);
drop policy if exists "registra o proprio dano" on public.clan_boss;
create policy "registra o proprio dano" on public.clan_boss for insert with check (auth.uid() = user_id and exists (select 1 from public.clan_members m where m.user_id = auth.uid() and m.clan_id = clan_boss.clan_id));
drop policy if exists "atualiza o proprio dano" on public.clan_boss;
create policy "atualiza o proprio dano" on public.clan_boss for update using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.clan_members m where m.user_id = auth.uid() and m.clan_id = clan_boss.clan_id));
