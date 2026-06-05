
-- Phase 1: multi-sport support on matches
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS sport text NOT NULL DEFAULT 'soccer',
  ADD COLUMN IF NOT EXISTS markets jsonb;
CREATE INDEX IF NOT EXISTS matches_sport_idx ON public.matches(sport);

-- sports_config: which sports/leagues to auto-import
CREATE TABLE IF NOT EXISTS public.sports_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  league_name text NOT NULL,
  league_external_id text,
  active boolean NOT NULL DEFAULT true,
  default_margin numeric NOT NULL DEFAULT 0.08,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sport, league_name)
);
GRANT SELECT ON public.sports_config TO anon, authenticated;
GRANT ALL ON public.sports_config TO service_role;
ALTER TABLE public.sports_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read sports config" ON public.sports_config FOR SELECT USING (true);
CREATE POLICY "admins manage sports config" ON public.sports_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed common leagues
INSERT INTO public.sports_config (sport, league_name, league_external_id, sort_order) VALUES
  ('soccer','English Premier League','4328',1),
  ('soccer','Spanish La Liga','4335',2),
  ('soccer','Italian Serie A','4332',3),
  ('soccer','German Bundesliga','4331',4),
  ('soccer','French Ligue 1','4334',5),
  ('soccer','UEFA Champions League','4480',6),
  ('basketball','NBA','4387',10),
  ('basketball','EuroLeague','4408',11),
  ('american football','NFL','4391',20),
  ('ice hockey','NHL','4380',30),
  ('baseball','MLB','4424',40),
  ('motorsport','Formula 1','4370',50),
  ('esports','CS2 Major','4715',60),
  ('esports','LoL LEC','4476',61)
ON CONFLICT (sport, league_name) DO NOTHING;

-- Phase 4: game_categories
CREATE TABLE IF NOT EXISTS public.game_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_categories TO anon, authenticated;
GRANT ALL ON public.game_categories TO service_role;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read categories" ON public.game_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.game_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.game_categories (slug, name, icon, sort_order) VALUES
  ('crash','Crash Games','🚀',1),
  ('quick','Quick Games','⚡',2),
  ('table','Table Games','🃏',3),
  ('lottery','Lottery','🎟️',4),
  ('jackpot','Jackpots','💰',5),
  ('virtuals','Virtuals','🤖',6)
ON CONFLICT (slug) DO NOTHING;

-- Extend games table
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS rtp numeric NOT NULL DEFAULT 97,
  ADD COLUMN IF NOT EXISTS min_stake numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_stake numeric NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS house_edge numeric NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS maintenance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.game_categories(id);

-- Backfill category_id from old text categories
UPDATE public.games g SET category_id = c.id
FROM public.game_categories c
WHERE g.category_id IS NULL AND (
  (lower(g.category) LIKE '%crash%' AND c.slug='crash') OR
  (lower(g.category) LIKE '%quick%' AND c.slug='quick') OR
  (lower(g.category) LIKE '%table%' AND c.slug='table')
);
UPDATE public.games SET category_id = (SELECT id FROM public.game_categories WHERE slug='quick')
  WHERE category_id IS NULL;

-- audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  admin_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_id = auth.uid());
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log(created_at DESC);

-- risk_settings (singleton)
CREATE TABLE IF NOT EXISTS public.risk_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  global_max_win numeric NOT NULL DEFAULT 1000000,
  daily_user_loss_cap numeric NOT NULL DEFAULT 100000,
  max_active_bets_per_user int NOT NULL DEFAULT 50,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.risk_settings TO authenticated;
GRANT ALL ON public.risk_settings TO service_role;
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read risk" ON public.risk_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage risk" ON public.risk_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.risk_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- updated_at triggers
DROP TRIGGER IF EXISTS sports_config_updated_at ON public.sports_config;
CREATE TRIGGER sports_config_updated_at BEFORE UPDATE ON public.sports_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS game_categories_updated_at ON public.game_categories;
CREATE TRIGGER game_categories_updated_at BEFORE UPDATE ON public.game_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
