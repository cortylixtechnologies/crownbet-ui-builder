
-- ============ ROLES ============
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  balance numeric not null default 1000,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins update all profiles" on public.profiles
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- on signup: create profile + auto-grant admin to the seed admin email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, balance)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 1000);

  insert into public.user_roles (user_id, role) values (new.id, 'user');

  if lower(new.email) = 'cortylixtechnologies@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ MATCHES ============
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  league text not null,
  league_icon text,
  home text not null,
  away text not null,
  match_date text not null,
  match_time text not null,
  odds_home numeric not null,
  odds_draw numeric not null,
  odds_away numeric not null,
  live boolean not null default false,
  score text,
  minute text,
  hot boolean not null default false,
  status text not null default 'scheduled', -- scheduled | live | finished
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.matches enable row level security;
create trigger matches_updated_at before update on public.matches
  for each row execute function public.update_updated_at_column();

create policy "anyone read matches" on public.matches for select using (true);
create policy "admins manage matches" on public.matches
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ PROMOTIONS ============
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color text not null,
  emoji text not null,
  to_url text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.promotions enable row level security;
create policy "anyone read promos" on public.promotions for select using (true);
create policy "admins manage promos" on public.promotions
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ GAMES ============
create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  color text not null,
  emoji text not null,
  category text not null,
  active boolean not null default true,
  sort_order int not null default 0
);
alter table public.games enable row level security;
create policy "anyone read games" on public.games for select using (true);
create policy "admins manage games" on public.games
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ BETS ============
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stake numeric not null check (stake > 0),
  total_odds numeric not null check (total_odds >= 1),
  potential_win numeric not null,
  status text not null default 'pending', -- pending | won | lost | void
  placed_at timestamptz not null default now(),
  settled_at timestamptz
);
alter table public.bets enable row level security;

create policy "users read own bets" on public.bets
  for select to authenticated using (auth.uid() = user_id);
create policy "admins read all bets" on public.bets
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins update bets" on public.bets
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
-- no insert policy: bets are only created via place_bet RPC (security definer)

create table public.bet_selections (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  match_label text not null,
  market text not null,
  pick text not null,
  odd numeric not null
);
alter table public.bet_selections enable row level security;

create policy "users read own selections" on public.bet_selections
  for select to authenticated using (
    exists (select 1 from public.bets b where b.id = bet_id and b.user_id = auth.uid())
  );
create policy "admins read all selections" on public.bet_selections
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- place_bet RPC: validates stake, deducts balance, inserts bet + selections atomically
create or replace function public.place_bet(_stake numeric, _selections jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_balance numeric;
  v_total_odds numeric := 1;
  v_min numeric;
  v_max numeric;
  v_accepting boolean;
  v_bet_id uuid;
  v_sel jsonb;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if jsonb_array_length(_selections) = 0 then raise exception 'no selections'; end if;

  select min_stake, max_stake, accepting_bets into v_min, v_max, v_accepting from public.site_settings where id = 1;
  if not coalesce(v_accepting, true) then raise exception 'bets are closed'; end if;
  if _stake < coalesce(v_min, 1) then raise exception 'stake below minimum'; end if;
  if _stake > coalesce(v_max, 100000) then raise exception 'stake above maximum'; end if;

  for v_sel in select * from jsonb_array_elements(_selections) loop
    v_total_odds := v_total_odds * (v_sel->>'odd')::numeric;
  end loop;

  select balance into v_balance from public.profiles where id = v_user for update;
  if v_balance < _stake then raise exception 'insufficient balance'; end if;

  update public.profiles set balance = balance - _stake where id = v_user;

  insert into public.bets (user_id, stake, total_odds, potential_win)
  values (v_user, _stake, v_total_odds, _stake * v_total_odds)
  returning id into v_bet_id;

  insert into public.bet_selections (bet_id, match_id, match_label, market, pick, odd)
  select
    v_bet_id,
    nullif(s->>'match_id','')::uuid,
    s->>'match_label',
    s->>'market',
    s->>'pick',
    (s->>'odd')::numeric
  from jsonb_array_elements(_selections) s;

  return v_bet_id;
end; $$;

-- ============ SITE SETTINGS ============
create table public.site_settings (
  id int primary key default 1,
  site_name text not null default 'Crownbet',
  maintenance boolean not null default false,
  accepting_bets boolean not null default true,
  min_stake numeric not null default 1,
  max_stake numeric not null default 10000,
  welcome_bonus_pct int not null default 100,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
alter table public.site_settings enable row level security;
create policy "anyone read settings" on public.site_settings for select using (true);
create policy "admins update settings" on public.site_settings
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins insert settings" on public.site_settings
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ============ SEED DATA ============
insert into public.matches (league, home, away, match_date, match_time, odds_home, odds_draw, odds_away, live, score, minute, hot) values
('UEFA Champions League','Arsenal','Atletico Madrid','Today','21:00',1.04,9.50,15.00,true,'1 - 0','90+2''',true),
('Premier League','Man City','Liverpool','Tomorrow','17:30',2.10,3.40,3.20,false,null,null,true),
('La Liga','Real Madrid','Barcelona','Sat','20:00',1.85,3.60,4.10,false,null,null,false),
('Serie A','Inter','Juventus','Sun','19:45',1.95,3.30,3.80,false,null,null,false),
('Bundesliga','Bayern','Dortmund','Sat','18:30',1.55,4.20,5.50,false,null,null,false),
('Ligue 1','PSG','Marseille','Sun','20:00',1.40,4.50,7.00,false,null,null,false),
('Copa Libertadores','Flamengo','Boca Juniors','Live','67''',2.20,3.10,3.40,true,'1 - 1','67''',false),
('MLS','Inter Miami','LA Galaxy','Live','34''',1.75,3.80,4.20,true,'2 - 0','34''',true),
('J-League','Kashima','Urawa Reds','Live','12''',2.50,3.20,2.80,true,'0 - 0','12''',false);

insert into public.promotions (title, color, emoji, to_url, sort_order) values
('Lucky Numbers','from-purple-500 to-pink-500','🎱','/games',1),
('JACKPOT','from-amber-500 to-red-600','🏆','/jackpot',2),
('Champions League','from-blue-700 to-indigo-900','⚽','/league/champions-league',3),
('Crown Missions','from-emerald-500 to-teal-700','👑','/promotions',4),
('Aviator','from-rose-500 to-orange-500','✈️','/games/aviator',5);

insert into public.games (slug, title, color, emoji, category, sort_order) values
('aviator','Aviator','from-rose-500 to-orange-500','✈️','Crash Games',1),
('mines','Mines','from-orange-600 to-red-900','💣','Quick Games',2),
('dice','Dice Roll','from-cyan-500 to-blue-700','🎲','Quick Games',3),
('coin-flip','Flip Da Coin','from-yellow-500 to-amber-700','🪙','Quick Games',4),
('wheel','Lucky Wheel','from-fuchsia-500 to-purple-700','🎡','Popular',5);
