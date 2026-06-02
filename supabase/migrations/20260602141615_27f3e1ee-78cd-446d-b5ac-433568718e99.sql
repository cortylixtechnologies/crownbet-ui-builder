
-- =====================================================
-- 1. MATCHES: external_id / approved / source
-- =====================================================
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS external_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Tighten public read policy: only approved or live matches visible
DROP POLICY IF EXISTS "anyone read matches" ON public.matches;
CREATE POLICY "public read approved matches"
ON public.matches
FOR SELECT
TO public
USING (approved = true OR live = true);

-- =====================================================
-- 2. PROFILES: prevent users from updating their own balance
-- =====================================================
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile (no balance)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND balance = (SELECT p.balance FROM public.profiles p WHERE p.id = auth.uid())
);

-- =====================================================
-- 3. Remove hardcoded admin email from new-user trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, balance)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    1000
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  RETURN new;
END;
$$;

-- =====================================================
-- 4. place_bet: validate odds server-side
-- =====================================================
CREATE OR REPLACE FUNCTION public.place_bet(_stake numeric, _selections jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance numeric;
  v_total_odds numeric := 1;
  v_min numeric;
  v_max numeric;
  v_accepting boolean;
  v_bet_id uuid;
  v_sel jsonb;
  v_match RECORD;
  v_pick text;
  v_real_odd numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF jsonb_array_length(_selections) = 0 THEN RAISE EXCEPTION 'no selections'; END IF;

  SELECT min_stake, max_stake, accepting_bets
    INTO v_min, v_max, v_accepting
    FROM public.site_settings WHERE id = 1;
  IF NOT COALESCE(v_accepting, true) THEN RAISE EXCEPTION 'bets are closed'; END IF;
  IF _stake < COALESCE(v_min, 1) THEN RAISE EXCEPTION 'stake below minimum'; END IF;
  IF _stake > COALESCE(v_max, 100000) THEN RAISE EXCEPTION 'stake above maximum'; END IF;

  -- Validate each selection: look up match and use server-side odds for the chosen pick.
  FOR v_sel IN SELECT * FROM jsonb_array_elements(_selections) LOOP
    IF NULLIF(v_sel->>'match_id','') IS NULL THEN
      RAISE EXCEPTION 'invalid selection: missing match_id';
    END IF;

    SELECT id, home, away, odds_home, odds_draw, odds_away, approved, live, status
      INTO v_match
      FROM public.matches
      WHERE id = (v_sel->>'match_id')::uuid;

    IF NOT FOUND THEN RAISE EXCEPTION 'match not found'; END IF;
    IF NOT v_match.approved AND NOT v_match.live THEN RAISE EXCEPTION 'match not available'; END IF;
    IF v_match.status = 'finished' THEN RAISE EXCEPTION 'match already finished'; END IF;

    v_pick := v_sel->>'pick';
    v_real_odd := CASE
      WHEN v_pick = '1' OR v_pick = v_match.home THEN v_match.odds_home
      WHEN v_pick = 'X' OR lower(v_pick) = 'draw' THEN v_match.odds_draw
      WHEN v_pick = '2' OR v_pick = v_match.away THEN v_match.odds_away
      ELSE NULL
    END;
    IF v_real_odd IS NULL OR v_real_odd <= 1 THEN
      RAISE EXCEPTION 'invalid pick or odd';
    END IF;

    v_total_odds := v_total_odds * v_real_odd;
  END LOOP;

  SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF v_balance < _stake THEN RAISE EXCEPTION 'insufficient balance'; END IF;

  UPDATE public.profiles SET balance = balance - _stake, updated_at = now() WHERE id = v_user;

  INSERT INTO public.bets (user_id, stake, total_odds, potential_win)
  VALUES (v_user, _stake, v_total_odds, _stake * v_total_odds)
  RETURNING id INTO v_bet_id;

  -- Re-insert selections using server-side odds.
  INSERT INTO public.bet_selections (bet_id, match_id, match_label, market, pick, odd)
  SELECT
    v_bet_id,
    (s->>'match_id')::uuid,
    COALESCE(s->>'match_label', m.home || ' vs ' || m.away),
    COALESCE(s->>'market', '1X2'),
    s->>'pick',
    CASE
      WHEN s->>'pick' = '1' OR s->>'pick' = m.home THEN m.odds_home
      WHEN s->>'pick' = 'X' OR lower(s->>'pick') = 'draw' THEN m.odds_draw
      WHEN s->>'pick' = '2' OR s->>'pick' = m.away THEN m.odds_away
    END
  FROM jsonb_array_elements(_selections) s
  JOIN public.matches m ON m.id = (s->>'match_id')::uuid;

  RETURN v_bet_id;
END;
$$;

-- =====================================================
-- 5. Drop old play_game; add server-side per-game RPCs
-- =====================================================
DROP FUNCTION IF EXISTS public.play_game(text, numeric, numeric, numeric, jsonb);

-- Helper to debit, credit, and record a game tx atomically.
CREATE OR REPLACE FUNCTION public._game_settle(
  _uid uuid, _game text, _stake numeric, _payout numeric,
  _multiplier numeric, _meta jsonb
) RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bal numeric; _new_bal numeric;
BEGIN
  SELECT balance INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF _bal < _stake THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  _new_bal := _bal - _stake + _payout;
  UPDATE public.profiles SET balance = _new_bal, updated_at = now() WHERE id = _uid;
  INSERT INTO public.game_transactions(user_id, game, stake, payout, net, multiplier, meta)
  VALUES (_uid, _game, _stake, _payout, _payout - _stake, _multiplier, _meta);
  RETURN _new_bal;
END $$;

-- Coin flip ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.play_coinflip(_stake numeric, _pick text)
RETURNS TABLE(result text, won boolean, payout numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r text; _won boolean; _payout numeric; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  IF _pick NOT IN ('H','T') THEN RAISE EXCEPTION 'Invalid pick'; END IF;
  _r := CASE WHEN random() < 0.48 THEN 'H' ELSE 'T' END;
  _won := _r = _pick;
  _payout := CASE WHEN _won THEN _stake * 2 ELSE 0 END;
  _nb := public._game_settle(_uid, 'coinflip', _stake, _payout,
    CASE WHEN _won THEN 2 ELSE 0 END, jsonb_build_object('pick',_pick,'result',_r));
  RETURN QUERY SELECT _r, _won, _payout, _nb;
END $$;

-- Dice ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.play_dice(_stake numeric, _target int, _over boolean)
RETURNS TABLE(roll numeric, won boolean, multiplier numeric, payout numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _roll numeric; _win_chance int; _mult numeric;
        _won boolean; _payout numeric; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  IF _target < 1 OR _target > 98 THEN RAISE EXCEPTION 'Invalid target'; END IF;
  _win_chance := CASE WHEN _over THEN 99 - _target ELSE _target END;
  IF _win_chance < 1 THEN RAISE EXCEPTION 'Invalid target'; END IF;
  _mult := round((98::numeric / _win_chance)::numeric, 2);
  _roll := round((random() * 100)::numeric, 2);
  _won := CASE WHEN _over THEN _roll > _target ELSE _roll < _target END;
  _payout := CASE WHEN _won THEN round(_stake * _mult, 2) ELSE 0 END;
  _nb := public._game_settle(_uid, 'dice', _stake, _payout,
    CASE WHEN _won THEN _mult ELSE 0 END,
    jsonb_build_object('roll',_roll,'target',_target,'over',_over));
  RETURN QUERY SELECT _roll, _won, _mult, _payout, _nb;
END $$;

-- Wheel --------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.play_wheel(_stake numeric)
RETURNS TABLE(segment int, multiplier numeric, payout numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _i int; _mults numeric[] := ARRAY[0,1.5,2,0,5,1.5,0,10]::numeric[];
        _m numeric; _payout numeric; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  _i := floor(random() * array_length(_mults,1))::int;
  _m := _mults[_i + 1];
  _payout := round(_stake * _m, 2);
  _nb := public._game_settle(_uid, 'wheel', _stake, _payout, _m,
    jsonb_build_object('segment', _i));
  RETURN QUERY SELECT _i, _m, _payout, _nb;
END $$;

-- Mines: persistent rounds ------------------------------------------
CREATE TABLE IF NOT EXISTS public.mines_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stake numeric NOT NULL,
  mines_count int NOT NULL,
  mine_tiles int[] NOT NULL,
  revealed int[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active', -- active | lost | cashed
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT ON public.mines_rounds TO authenticated;
GRANT ALL ON public.mines_rounds TO service_role;
ALTER TABLE public.mines_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own mines rounds"
ON public.mines_rounds FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.mines_start(_stake numeric, _mines_count int)
RETURNS TABLE(round_id uuid, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _tiles int[]; _nb numeric; _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  IF _mines_count < 1 OR _mines_count > 24 THEN RAISE EXCEPTION 'Invalid mines'; END IF;
  -- random tiles 0..24
  SELECT array_agg(t) INTO _tiles FROM (
    SELECT t FROM generate_series(0,24) t ORDER BY random() LIMIT _mines_count
  ) s;
  _nb := public._game_settle(_uid, 'mines', _stake, 0, 0,
    jsonb_build_object('phase','start','mines',_mines_count));
  INSERT INTO public.mines_rounds(user_id, stake, mines_count, mine_tiles)
  VALUES (_uid, _stake, _mines_count, _tiles)
  RETURNING id INTO _id;
  RETURN QUERY SELECT _id, _nb;
END $$;

CREATE OR REPLACE FUNCTION public.mines_pick(_round_id uuid, _tile int)
RETURNS TABLE(hit_mine boolean, revealed_count int, multiplier numeric, status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r RECORD; _new_rev int[]; _mult numeric := 1; _safe int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _tile < 0 OR _tile > 24 THEN RAISE EXCEPTION 'Invalid tile'; END IF;
  SELECT * INTO _r FROM public.mines_rounds WHERE id = _round_id AND user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF _r.status <> 'active' THEN RAISE EXCEPTION 'Round not active'; END IF;
  IF _tile = ANY(_r.revealed) THEN RAISE EXCEPTION 'Tile already revealed'; END IF;

  IF _tile = ANY(_r.mine_tiles) THEN
    UPDATE public.mines_rounds SET status='lost', ended_at=now(),
      revealed = array_append(revealed, _tile)
      WHERE id = _round_id;
    RETURN QUERY SELECT true, array_length(_r.revealed,1), 0::numeric, 'lost'::text;
    RETURN;
  END IF;

  _new_rev := array_append(_r.revealed, _tile);
  _safe := COALESCE(array_length(_new_rev,1),0);
  -- multiplier formula matching FE (0.97 house edge)
  FOR i IN 0.._safe-1 LOOP
    _mult := _mult * ((25 - i)::numeric / (25 - _r.mines_count - i));
  END LOOP;
  _mult := round(_mult * 0.97, 2);
  UPDATE public.mines_rounds SET revealed = _new_rev WHERE id = _round_id;
  RETURN QUERY SELECT false, _safe, _mult, 'active'::text;
END $$;

CREATE OR REPLACE FUNCTION public.mines_cashout(_round_id uuid)
RETURNS TABLE(payout numeric, multiplier numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r RECORD; _mult numeric := 1; _safe int;
        _payout numeric; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _r FROM public.mines_rounds WHERE id = _round_id AND user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF _r.status <> 'active' THEN RAISE EXCEPTION 'Round not active'; END IF;
  _safe := COALESCE(array_length(_r.revealed,1),0);
  IF _safe = 0 THEN RAISE EXCEPTION 'Reveal at least one tile'; END IF;
  FOR i IN 0.._safe-1 LOOP
    _mult := _mult * ((25 - i)::numeric / (25 - _r.mines_count - i));
  END LOOP;
  _mult := round(_mult * 0.97, 2);
  _payout := round(_r.stake * _mult, 2);
  UPDATE public.mines_rounds SET status='cashed', ended_at=now() WHERE id = _round_id;
  -- Stake already debited at start; credit only the payout.
  _nb := public._game_settle(_uid, 'mines', 0, _payout, _mult,
    jsonb_build_object('phase','cashout','round_id',_round_id,'revealed',_safe));
  RETURN QUERY SELECT _payout, _mult, _nb;
END $$;

-- Aviator: persistent rounds ----------------------------------------
CREATE TABLE IF NOT EXISTS public.aviator_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stake numeric NOT NULL,
  crash_multiplier numeric NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active', -- active | cashed | crashed
  cashed_at_multiplier numeric,
  ended_at timestamptz
);
GRANT SELECT ON public.aviator_rounds TO authenticated;
GRANT ALL ON public.aviator_rounds TO service_role;
ALTER TABLE public.aviator_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own aviator rounds"
ON public.aviator_rounds FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.aviator_start(_stake numeric)
RETURNS TABLE(round_id uuid, started_at timestamptz, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r numeric; _crash numeric; _nb numeric; _id uuid; _ts timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  _r := random();
  _crash := round(GREATEST(1.01, 1.0 / (1.0 - _r * 0.97))::numeric, 2);
  _nb := public._game_settle(_uid, 'aviator', _stake, 0, 0,
    jsonb_build_object('phase','bet'));
  INSERT INTO public.aviator_rounds(user_id, stake, crash_multiplier)
  VALUES (_uid, _stake, _crash)
  RETURNING id, public.aviator_rounds.started_at INTO _id, _ts;
  RETURN QUERY SELECT _id, _ts, _nb;
END $$;

CREATE OR REPLACE FUNCTION public.aviator_cashout(_round_id uuid, _claimed_multiplier numeric)
RETURNS TABLE(payout numeric, multiplier numeric, crashed boolean, crash_multiplier numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r RECORD; _elapsed numeric; _server_m numeric;
        _final numeric; _payout numeric; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _r FROM public.aviator_rounds WHERE id = _round_id AND user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF _r.status <> 'active' THEN RAISE EXCEPTION 'Round not active'; END IF;

  _elapsed := EXTRACT(EPOCH FROM (now() - _r.started_at))::numeric;
  -- FE curve: m = exp(elapsed * 0.35). Add 0.5s leeway for latency.
  _server_m := round(exp(LEAST(_elapsed + 0.5, 30) * 0.35)::numeric, 2);

  IF _server_m >= _r.crash_multiplier OR _claimed_multiplier > _r.crash_multiplier THEN
    UPDATE public.aviator_rounds SET status='crashed', ended_at=now() WHERE id=_round_id;
    RETURN QUERY SELECT 0::numeric, _r.crash_multiplier, true, _r.crash_multiplier, (SELECT balance FROM public.profiles WHERE id=_uid);
    RETURN;
  END IF;

  _final := LEAST(_claimed_multiplier, _server_m);
  IF _final < 1.0 THEN _final := 1.0; END IF;
  _payout := round(_r.stake * _final, 2);
  UPDATE public.aviator_rounds SET status='cashed', cashed_at_multiplier=_final, ended_at=now()
    WHERE id=_round_id;
  _nb := public._game_settle(_uid, 'aviator', 0, _payout, _final,
    jsonb_build_object('phase','cashout','round_id',_round_id));
  RETURN QUERY SELECT _payout, _final, false, _r.crash_multiplier, _nb;
END $$;

-- Auto-resolve an aviator round as crashed (called when FE detects timeout)
CREATE OR REPLACE FUNCTION public.aviator_resolve_crashed(_round_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.aviator_rounds SET status='crashed', ended_at=now()
    WHERE id=_round_id AND user_id=_uid AND status='active';
END $$;

-- =====================================================
-- 6. Lock down SECURITY DEFINER function execution
-- =====================================================
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._game_settle(uuid, text, numeric, numeric, numeric, jsonb) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.place_bet(numeric, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_bet(numeric, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.play_coinflip(numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.play_coinflip(numeric, text) TO authenticated;

REVOKE ALL ON FUNCTION public.play_dice(numeric, int, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.play_dice(numeric, int, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.play_wheel(numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.play_wheel(numeric) TO authenticated;

REVOKE ALL ON FUNCTION public.mines_start(numeric, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mines_start(numeric, int) TO authenticated;
REVOKE ALL ON FUNCTION public.mines_pick(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mines_pick(uuid, int) TO authenticated;
REVOKE ALL ON FUNCTION public.mines_cashout(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mines_cashout(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.aviator_start(numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aviator_start(numeric) TO authenticated;
REVOKE ALL ON FUNCTION public.aviator_cashout(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aviator_cashout(uuid, numeric) TO authenticated;
REVOKE ALL ON FUNCTION public.aviator_resolve_crashed(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aviator_resolve_crashed(uuid) TO authenticated;

-- =====================================================
-- 7. Schedule fixture import every 6 hours
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
