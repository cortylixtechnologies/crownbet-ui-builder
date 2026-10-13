CREATE POLICY "Admins view all game tx" ON public.game_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_settle_bet(_bet_id uuid, _result text)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b public.bets%ROWTYPE; credit numeric := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF _result NOT IN ('won','lost','void') THEN RAISE EXCEPTION 'bad result'; END IF;
  SELECT * INTO b FROM public.bets WHERE id = _bet_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'bet not found'; END IF;
  IF b.status <> 'pending' THEN RAISE EXCEPTION 'bet already settled'; END IF;
  IF _result = 'won' THEN credit := b.potential_win; ELSIF _result = 'void' THEN credit := b.stake; END IF;
  UPDATE public.bets SET status = _result, settled_at = now() WHERE id = _bet_id;
  IF credit > 0 THEN UPDATE public.profiles SET balance = balance + credit WHERE id = b.user_id; END IF;
  INSERT INTO public.audit_log(admin_id, action, entity, entity_id, details)
  VALUES (auth.uid(), 'settle_bet', 'bets', _bet_id::text, jsonb_build_object('result', _result, 'credit', credit));
  RETURN credit;
END $$;
REVOKE ALL ON FUNCTION public.admin_settle_bet(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_settle_bet(uuid, text) TO authenticated;