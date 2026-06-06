
-- ============ CASINO GAMES (registered in games library) ============
INSERT INTO public.games (slug, title, emoji, color, category, active, rtp, min_stake, max_stake, sort_order)
VALUES
 ('roulette','Roulette','🎡','from-red-600 to-black', 'Casino', true, 97, 1, 50000, 20),
 ('sic-bo','Sic Bo','🎲','from-emerald-600 to-teal-800','Casino', true, 97, 1, 50000, 21),
 ('blackjack','Blackjack','🃏','from-slate-800 to-emerald-900','Casino', true, 99, 1, 50000, 22)
ON CONFLICT (slug) DO NOTHING;

-- ============ ROULETTE RPC ============
-- European wheel (0..36). _bets jsonb: [{type:'straight',value:17,stake:10},{type:'red',stake:5},...]
-- Types: straight, red, black, odd, even, low(1-18), high(19-36), dozen1/2/3, col1/2/3.
CREATE OR REPLACE FUNCTION public.play_roulette(_bets jsonb)
RETURNS TABLE(spin int, total_stake numeric, total_payout numeric, new_balance numeric, wins jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _spin int; _total numeric := 0; _payout numeric := 0;
        _b jsonb; _t text; _stake numeric; _val int; _mult numeric; _is_red boolean;
        _wins jsonb := '[]'::jsonb; _nb numeric;
        _red int[] := ARRAY[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF jsonb_array_length(_bets) = 0 THEN RAISE EXCEPTION 'No bets'; END IF;
  _spin := floor(random()*37)::int;
  _is_red := _spin = ANY(_red);
  FOR _b IN SELECT * FROM jsonb_array_elements(_bets) LOOP
    _t := _b->>'type'; _stake := (_b->>'stake')::numeric;
    IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
    _total := _total + _stake;
    _mult := 0;
    IF _t = 'straight' THEN
      _val := (_b->>'value')::int;
      IF _val = _spin THEN _mult := 36; END IF;
    ELSIF _t = 'red'   AND _is_red AND _spin <> 0 THEN _mult := 2;
    ELSIF _t = 'black' AND NOT _is_red AND _spin <> 0 THEN _mult := 2;
    ELSIF _t = 'odd'   AND _spin <> 0 AND _spin % 2 = 1 THEN _mult := 2;
    ELSIF _t = 'even'  AND _spin <> 0 AND _spin % 2 = 0 THEN _mult := 2;
    ELSIF _t = 'low'   AND _spin BETWEEN 1 AND 18 THEN _mult := 2;
    ELSIF _t = 'high'  AND _spin BETWEEN 19 AND 36 THEN _mult := 2;
    ELSIF _t = 'dozen1' AND _spin BETWEEN 1 AND 12 THEN _mult := 3;
    ELSIF _t = 'dozen2' AND _spin BETWEEN 13 AND 24 THEN _mult := 3;
    ELSIF _t = 'dozen3' AND _spin BETWEEN 25 AND 36 THEN _mult := 3;
    ELSIF _t = 'col1'   AND _spin <> 0 AND _spin % 3 = 1 THEN _mult := 3;
    ELSIF _t = 'col2'   AND _spin <> 0 AND _spin % 3 = 2 THEN _mult := 3;
    ELSIF _t = 'col3'   AND _spin <> 0 AND _spin % 3 = 0 THEN _mult := 3;
    END IF;
    IF _mult > 0 THEN
      _payout := _payout + _stake * _mult;
      _wins := _wins || jsonb_build_object('type',_t,'stake',_stake,'mult',_mult);
    END IF;
  END LOOP;
  _nb := public._game_settle(_uid,'roulette',_total,_payout,
    CASE WHEN _total>0 THEN round(_payout/_total,2) ELSE 0 END,
    jsonb_build_object('spin',_spin,'wins',_wins));
  RETURN QUERY SELECT _spin,_total,_payout,_nb,_wins;
END $$;

-- ============ SIC BO RPC ============
-- _bets: [{type:'small'|'big'|'odd'|'even'|'total',value:?,stake},{type:'triple',value:1..6,stake},{type:'any_triple',stake}]
CREATE OR REPLACE FUNCTION public.play_sicbo(_bets jsonb)
RETURNS TABLE(d1 int, d2 int, d3 int, total_stake numeric, total_payout numeric, new_balance numeric, wins jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _d1 int; _d2 int; _d3 int; _sum int; _trip boolean;
        _b jsonb; _t text; _stake numeric; _mult numeric; _v int;
        _total numeric := 0; _payout numeric := 0; _wins jsonb := '[]'::jsonb; _nb numeric;
        _total_mults int[] := ARRAY[NULL,NULL,NULL,NULL,60,30,17,12,8,6,6,8,12,17,30,60,NULL]; -- index by sum 4..17
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF jsonb_array_length(_bets) = 0 THEN RAISE EXCEPTION 'No bets'; END IF;
  _d1 := floor(random()*6)::int + 1;
  _d2 := floor(random()*6)::int + 1;
  _d3 := floor(random()*6)::int + 1;
  _sum := _d1 + _d2 + _d3;
  _trip := _d1 = _d2 AND _d2 = _d3;
  FOR _b IN SELECT * FROM jsonb_array_elements(_bets) LOOP
    _t := _b->>'type'; _stake := (_b->>'stake')::numeric;
    IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
    _total := _total + _stake; _mult := 0;
    IF _t = 'small' AND NOT _trip AND _sum BETWEEN 4 AND 10 THEN _mult := 2;
    ELSIF _t = 'big' AND NOT _trip AND _sum BETWEEN 11 AND 17 THEN _mult := 2;
    ELSIF _t = 'odd' AND NOT _trip AND _sum % 2 = 1 THEN _mult := 2;
    ELSIF _t = 'even' AND NOT _trip AND _sum % 2 = 0 THEN _mult := 2;
    ELSIF _t = 'any_triple' AND _trip THEN _mult := 31;
    ELSIF _t = 'triple' THEN
      _v := (_b->>'value')::int;
      IF _trip AND _d1 = _v THEN _mult := 181; END IF;
    ELSIF _t = 'total' THEN
      _v := (_b->>'value')::int;
      IF _v = _sum AND _v BETWEEN 4 AND 17 THEN
        _mult := COALESCE(_total_mults[_v - 3], 0);
      END IF;
    ELSIF _t = 'single' THEN
      _v := (_b->>'value')::int;
      IF _d1=_v THEN _mult := _mult+2; END IF;
      IF _d2=_v THEN _mult := _mult+2; END IF;
      IF _d3=_v THEN _mult := _mult+2; END IF;
      IF _mult > 0 THEN _mult := _mult - 1; END IF; -- net: 1 die match = even money
    END IF;
    IF _mult > 0 THEN
      _payout := _payout + _stake * _mult;
      _wins := _wins || jsonb_build_object('type',_t,'value',_b->'value','stake',_stake,'mult',_mult);
    END IF;
  END LOOP;
  _nb := public._game_settle(_uid,'sicbo',_total,_payout,
    CASE WHEN _total>0 THEN round(_payout/_total,2) ELSE 0 END,
    jsonb_build_object('dice',jsonb_build_array(_d1,_d2,_d3),'sum',_sum));
  RETURN QUERY SELECT _d1,_d2,_d3,_total,_payout,_nb,_wins;
END $$;

-- ============ BLACKJACK ============
CREATE TABLE IF NOT EXISTS public.blackjack_rounds(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stake numeric NOT NULL,
  deck int[] NOT NULL,           -- remaining deck (top first)
  player int[] NOT NULL,          -- card values (1=A,2..10,11=J,12=Q,13=K)
  dealer int[] NOT NULL,
  status text NOT NULL DEFAULT 'active',  -- active/won/lost/push/blackjack/bust
  payout numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT ON public.blackjack_rounds TO authenticated;
GRANT ALL ON public.blackjack_rounds TO service_role;
ALTER TABLE public.blackjack_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own bj rounds" ON public.blackjack_rounds
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public._bj_hand_value(_h int[])
RETURNS int LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE _total int := 0; _aces int := 0; _c int;
BEGIN
  FOREACH _c IN ARRAY _h LOOP
    IF _c = 1 THEN _total := _total + 11; _aces := _aces + 1;
    ELSIF _c >= 10 THEN _total := _total + 10;
    ELSE _total := _total + _c; END IF;
  END LOOP;
  WHILE _total > 21 AND _aces > 0 LOOP _total := _total - 10; _aces := _aces - 1; END LOOP;
  RETURN _total;
END $$;

CREATE OR REPLACE FUNCTION public._bj_new_deck() RETURNS int[]
LANGUAGE sql AS $$
  SELECT array_agg(c ORDER BY random()) FROM (
    SELECT generate_series(1,13) AS c FROM generate_series(1,4)
  ) s;
$$;

CREATE OR REPLACE FUNCTION public.blackjack_start(_stake numeric)
RETURNS TABLE(round_id uuid, player int[], dealer_up int, status text, value int, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _deck int[]; _player int[]; _dealer int[]; _id uuid; _nb numeric;
        _pv int; _payout numeric := 0; _status text := 'active';
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake <= 0 THEN RAISE EXCEPTION 'Invalid stake'; END IF;
  _deck := public._bj_new_deck();
  _player := ARRAY[_deck[1], _deck[3]];
  _dealer := ARRAY[_deck[2], _deck[4]];
  _deck := _deck[5:array_length(_deck,1)];
  _pv := public._bj_hand_value(_player);
  IF _pv = 21 THEN
    IF public._bj_hand_value(_dealer) = 21 THEN
      _status := 'push'; _payout := _stake;
    ELSE
      _status := 'blackjack'; _payout := round(_stake * 2.5, 2);
    END IF;
  END IF;
  _nb := public._game_settle(_uid,'blackjack',_stake,_payout,
    CASE WHEN _payout>0 THEN round(_payout/_stake,2) ELSE 0 END,
    jsonb_build_object('phase','start','status',_status));
  INSERT INTO public.blackjack_rounds(user_id,stake,deck,player,dealer,status,payout,ended_at)
  VALUES(_uid,_stake,_deck,_player,_dealer,_status,_payout,
    CASE WHEN _status='active' THEN NULL ELSE now() END)
  RETURNING id INTO _id;
  RETURN QUERY SELECT _id,_player,_dealer[1],_status,_pv,_nb;
END $$;

CREATE OR REPLACE FUNCTION public.blackjack_hit(_round_id uuid)
RETURNS TABLE(player int[], status text, value int, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r RECORD; _v int; _status text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _r FROM public.blackjack_rounds WHERE id=_round_id AND user_id=_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF _r.status <> 'active' THEN RAISE EXCEPTION 'Round not active'; END IF;
  _r.player := array_append(_r.player, _r.deck[1]);
  _r.deck := _r.deck[2:array_length(_r.deck,1)];
  _v := public._bj_hand_value(_r.player);
  _status := CASE WHEN _v > 21 THEN 'bust' ELSE 'active' END;
  UPDATE public.blackjack_rounds SET player=_r.player, deck=_r.deck, status=_status,
    ended_at=CASE WHEN _status='bust' THEN now() ELSE NULL END
    WHERE id=_round_id;
  RETURN QUERY SELECT _r.player,_status,_v,(SELECT balance FROM public.profiles WHERE id=_uid);
END $$;

CREATE OR REPLACE FUNCTION public.blackjack_stand(_round_id uuid)
RETURNS TABLE(player int[], dealer int[], status text, payout numeric, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _r RECORD; _pv int; _dv int; _payout numeric := 0; _status text; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _r FROM public.blackjack_rounds WHERE id=_round_id AND user_id=_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF _r.status <> 'active' THEN RAISE EXCEPTION 'Round not active'; END IF;
  _pv := public._bj_hand_value(_r.player);
  _dv := public._bj_hand_value(_r.dealer);
  WHILE _dv < 17 LOOP
    _r.dealer := array_append(_r.dealer, _r.deck[1]);
    _r.deck := _r.deck[2:array_length(_r.deck,1)];
    _dv := public._bj_hand_value(_r.dealer);
  END LOOP;
  IF _dv > 21 OR _pv > _dv THEN _status:='won'; _payout := _r.stake*2;
  ELSIF _pv = _dv THEN _status:='push'; _payout := _r.stake;
  ELSE _status:='lost'; _payout := 0;
  END IF;
  _nb := public._game_settle(_uid,'blackjack',0,_payout,
    CASE WHEN _payout>0 THEN round(_payout/_r.stake,2) ELSE 0 END,
    jsonb_build_object('phase','stand','status',_status,'round_id',_round_id));
  UPDATE public.blackjack_rounds SET dealer=_r.dealer, deck=_r.deck, status=_status,
    payout=_payout, ended_at=now() WHERE id=_round_id;
  RETURN QUERY SELECT _r.player,_r.dealer,_status,_payout,_nb;
END $$;

-- ============ LOTTERY ============
CREATE TABLE IF NOT EXISTS public.lottery_draws(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_no serial UNIQUE,
  game_type text NOT NULL DEFAULT '6_49',  -- 6/49 lotto
  ticket_price numeric NOT NULL DEFAULT 100,
  prize_pool numeric NOT NULL DEFAULT 0,
  jackpot numeric NOT NULL DEFAULT 1000000,
  draw_at timestamptz NOT NULL,
  winning_numbers int[],
  status text NOT NULL DEFAULT 'open',  -- open/closed/settled
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);
GRANT SELECT ON public.lottery_draws TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lottery_draws TO authenticated;
GRANT ALL ON public.lottery_draws TO service_role;
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read draws" ON public.lottery_draws FOR SELECT USING (true);
CREATE POLICY "admins manage draws" ON public.lottery_draws FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.lottery_tickets(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  numbers int[] NOT NULL,
  stake numeric NOT NULL,
  matched int NOT NULL DEFAULT 0,
  prize numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lottery_tickets TO authenticated;
GRANT ALL ON public.lottery_tickets TO service_role;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own tickets" ON public.lottery_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "admins read all tickets" ON public.lottery_tickets FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.lottery_buy_ticket(_draw_id uuid, _numbers int[])
RETURNS TABLE(ticket_id uuid, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _d RECORD; _id uuid; _nb numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF array_length(_numbers,1) <> 6 THEN RAISE EXCEPTION 'Pick exactly 6 numbers'; END IF;
  IF (SELECT COUNT(DISTINCT x) FROM unnest(_numbers) x) <> 6 THEN RAISE EXCEPTION 'Numbers must be unique'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(_numbers) x WHERE x<1 OR x>49) THEN RAISE EXCEPTION 'Numbers 1-49'; END IF;
  SELECT * INTO _d FROM public.lottery_draws WHERE id=_draw_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Draw not found'; END IF;
  IF _d.status <> 'open' OR _d.draw_at <= now() THEN RAISE EXCEPTION 'Draw closed'; END IF;
  _nb := public._game_settle(_uid,'lottery',_d.ticket_price,0,0,
    jsonb_build_object('draw_id',_draw_id,'numbers',_numbers));
  UPDATE public.lottery_draws SET prize_pool = prize_pool + _d.ticket_price*0.5 WHERE id=_draw_id;
  INSERT INTO public.lottery_tickets(draw_id,user_id,numbers,stake)
  VALUES(_draw_id,_uid,_numbers,_d.ticket_price) RETURNING id INTO _id;
  RETURN QUERY SELECT _id,_nb;
END $$;

CREATE OR REPLACE FUNCTION public.lottery_settle_draw(_draw_id uuid)
RETURNS TABLE(winning_numbers int[], tickets_settled int, total_paid numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d RECORD; _win int[]; _t RECORD; _matched int; _prize numeric; _count int := 0; _paid numeric := 0;
        _new_nums int[];
BEGIN
  IF NOT (auth.uid() IS NULL OR has_role(auth.uid(),'admin')) THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  SELECT * INTO _d FROM public.lottery_draws WHERE id=_draw_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Draw not found'; END IF;
  IF _d.status = 'settled' THEN RAISE EXCEPTION 'Already settled'; END IF;

  IF _d.winning_numbers IS NULL THEN
    SELECT array_agg(n ORDER BY n) INTO _new_nums FROM (
      SELECT n FROM generate_series(1,49) n ORDER BY random() LIMIT 6
    ) s;
    _win := _new_nums;
  ELSE
    _win := _d.winning_numbers;
  END IF;

  FOR _t IN SELECT * FROM public.lottery_tickets WHERE draw_id=_draw_id AND status='pending' LOOP
    SELECT COUNT(*) INTO _matched FROM unnest(_t.numbers) x WHERE x = ANY(_win);
    _prize := CASE _matched
      WHEN 6 THEN _d.jackpot
      WHEN 5 THEN _d.ticket_price * 500
      WHEN 4 THEN _d.ticket_price * 50
      WHEN 3 THEN _d.ticket_price * 5
      ELSE 0 END;
    UPDATE public.lottery_tickets SET matched=_matched, prize=_prize,
      status=CASE WHEN _prize>0 THEN 'won' ELSE 'lost' END WHERE id=_t.id;
    IF _prize > 0 THEN
      UPDATE public.profiles SET balance = balance + _prize WHERE id=_t.user_id;
      INSERT INTO public.game_transactions(user_id,game,stake,payout,net,multiplier,meta)
      VALUES(_t.user_id,'lottery',0,_prize,_prize, round(_prize/_t.stake,2),
        jsonb_build_object('draw_id',_draw_id,'matched',_matched));
      _paid := _paid + _prize;
    END IF;
    _count := _count + 1;
  END LOOP;

  UPDATE public.lottery_draws SET winning_numbers=_win, status='settled', settled_at=now()
    WHERE id=_draw_id;
  RETURN QUERY SELECT _win,_count,_paid;
END $$;

-- ============ JACKPOT POOLS ============
CREATE TABLE IF NOT EXISTS public.jackpots(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prize numeric NOT NULL DEFAULT 0,
  entry_fee numeric NOT NULL DEFAULT 100,
  deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open',  -- open/closed/settled
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);
GRANT SELECT ON public.jackpots TO anon;
GRANT SELECT ON public.jackpots TO authenticated;
GRANT ALL ON public.jackpots TO service_role;
ALTER TABLE public.jackpots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read jackpots" ON public.jackpots FOR SELECT USING (true);
CREATE POLICY "admins manage jackpots" ON public.jackpots FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.jackpot_matches(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jackpot_id uuid NOT NULL REFERENCES public.jackpots(id) ON DELETE CASCADE,
  match_id uuid NOT NULL,
  result text  -- '1','X','2' once decided
);
GRANT SELECT ON public.jackpot_matches TO anon;
GRANT SELECT ON public.jackpot_matches TO authenticated;
GRANT ALL ON public.jackpot_matches TO service_role;
ALTER TABLE public.jackpot_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read jp matches" ON public.jackpot_matches FOR SELECT USING (true);
CREATE POLICY "admins manage jp matches" ON public.jackpot_matches FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.jackpot_entries(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jackpot_id uuid NOT NULL REFERENCES public.jackpots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  picks jsonb NOT NULL,  -- {match_id: '1'|'X'|'2'}
  correct_count int NOT NULL DEFAULT 0,
  prize numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jackpot_entries TO authenticated;
GRANT ALL ON public.jackpot_entries TO service_role;
ALTER TABLE public.jackpot_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own jp entries" ON public.jackpot_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "admins read all jp entries" ON public.jackpot_entries FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.jackpot_enter(_jp_id uuid, _picks jsonb)
RETURNS TABLE(entry_id uuid, new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _j RECORD; _id uuid; _nb numeric; _need int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _j FROM public.jackpots WHERE id=_jp_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Jackpot not found'; END IF;
  IF _j.status <> 'open' OR _j.deadline <= now() THEN RAISE EXCEPTION 'Jackpot closed'; END IF;
  SELECT COUNT(*) INTO _need FROM public.jackpot_matches WHERE jackpot_id=_jp_id;
  IF _need = 0 THEN RAISE EXCEPTION 'No matches in jackpot'; END IF;
  IF (SELECT COUNT(*) FROM jsonb_object_keys(_picks)) <> _need THEN
    RAISE EXCEPTION 'Pick all % matches', _need;
  END IF;
  _nb := public._game_settle(_uid,'jackpot',_j.entry_fee,0,0,
    jsonb_build_object('jackpot_id',_jp_id));
  INSERT INTO public.jackpot_entries(jackpot_id,user_id,picks)
  VALUES(_jp_id,_uid,_picks) RETURNING id INTO _id;
  RETURN QUERY SELECT _id,_nb;
END $$;

CREATE OR REPLACE FUNCTION public.jackpot_settle(_jp_id uuid)
RETURNS TABLE(winners int, total_paid numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _j RECORD; _need int; _e RECORD; _correct int; _winners int := 0; _share numeric := 0; _paid numeric := 0;
        _picks jsonb; _results jsonb;
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin only'; END IF;
  SELECT * INTO _j FROM public.jackpots WHERE id=_jp_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Jackpot not found'; END IF;
  IF _j.status = 'settled' THEN RAISE EXCEPTION 'Already settled'; END IF;

  IF EXISTS (SELECT 1 FROM public.jackpot_matches WHERE jackpot_id=_jp_id AND result IS NULL) THEN
    RAISE EXCEPTION 'All match results required';
  END IF;
  SELECT COUNT(*) INTO _need FROM public.jackpot_matches WHERE jackpot_id=_jp_id;
  SELECT jsonb_object_agg(match_id::text, result) INTO _results
    FROM public.jackpot_matches WHERE jackpot_id=_jp_id;

  -- first pass: score everyone
  FOR _e IN SELECT * FROM public.jackpot_entries WHERE jackpot_id=_jp_id LOOP
    _correct := 0;
    SELECT COUNT(*) INTO _correct FROM jsonb_each_text(_e.picks) p
      WHERE _results->>(p.key) = p.value;
    UPDATE public.jackpot_entries SET correct_count = _correct WHERE id=_e.id;
    IF _correct = _need THEN _winners := _winners + 1; END IF;
  END LOOP;

  IF _winners > 0 THEN
    _share := round(_j.prize / _winners, 2);
    FOR _e IN SELECT * FROM public.jackpot_entries WHERE jackpot_id=_jp_id AND correct_count=_need LOOP
      UPDATE public.jackpot_entries SET prize=_share, status='won' WHERE id=_e.id;
      UPDATE public.profiles SET balance = balance + _share WHERE id=_e.user_id;
      INSERT INTO public.game_transactions(user_id,game,stake,payout,net,multiplier,meta)
      VALUES(_e.user_id,'jackpot',0,_share,_share, 0,
        jsonb_build_object('jackpot_id',_jp_id));
      _paid := _paid + _share;
    END LOOP;
  END IF;
  UPDATE public.jackpot_entries SET status='lost' WHERE jackpot_id=_jp_id AND status='pending';
  UPDATE public.jackpots SET status='settled', settled_at=now() WHERE id=_jp_id;
  RETURN QUERY SELECT _winners, _paid;
END $$;
