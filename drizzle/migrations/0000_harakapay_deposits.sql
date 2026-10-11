CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 100),
  order_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  credited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.deposits TO authenticated;
GRANT ALL ON public.deposits TO service_role;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own deposits" ON public.deposits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all deposits" ON public.deposits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE SCHEMA IF NOT EXISTS app_private;
CREATE OR REPLACE FUNCTION app_private.credit_deposit(_order_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d record;
BEGIN
  UPDATE public.deposits SET status='completed', credited_at=now(), updated_at=now()
   WHERE order_id=_order_id AND credited_at IS NULL
   RETURNING user_id, amount INTO d;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.profiles SET balance = balance + d.amount WHERE id = d.user_id;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION app_private.credit_deposit(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.credit_deposit(_order_id text)
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  SELECT app_private.credit_deposit(_order_id) $$;
REVOKE ALL ON FUNCTION public.credit_deposit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_deposit(text) TO service_role;
GRANT USAGE ON SCHEMA app_private TO service_role;
GRANT EXECUTE ON FUNCTION app_private.credit_deposit(text) TO service_role;