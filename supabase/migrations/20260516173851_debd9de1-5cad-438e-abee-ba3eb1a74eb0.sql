
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'cortylixtechnologies@gmail.com';

CREATE TABLE public.game_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game text NOT NULL,
  stake numeric NOT NULL DEFAULT 0,
  payout numeric NOT NULL DEFAULT 0,
  net numeric NOT NULL DEFAULT 0,
  multiplier numeric,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own game tx"
  ON public.game_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_game_tx_user ON public.game_transactions(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.play_game(
  _game text,
  _stake numeric,
  _payout numeric,
  _multiplier numeric DEFAULT NULL,
  _meta jsonb DEFAULT NULL
)
RETURNS TABLE(new_balance numeric, tx_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric;
  _new_bal numeric;
  _tx_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _stake < 0 OR _payout < 0 THEN RAISE EXCEPTION 'Invalid amounts'; END IF;

  SELECT balance INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF _bal < _stake THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  _new_bal := _bal - _stake + _payout;
  UPDATE public.profiles SET balance = _new_bal, updated_at = now() WHERE id = _uid;

  INSERT INTO public.game_transactions(user_id, game, stake, payout, net, multiplier, meta)
  VALUES (_uid, _game, _stake, _payout, _payout - _stake, _multiplier, _meta)
  RETURNING id INTO _tx_id;

  RETURN QUERY SELECT _new_bal, _tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.play_game(text, numeric, numeric, numeric, jsonb) TO authenticated;
