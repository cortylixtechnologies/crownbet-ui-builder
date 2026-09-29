CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO authenticated;
CREATE OR REPLACE FUNCTION app_private.claim_welcome_credit()
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app_private AS $$
DECLARE v_balance numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.profiles
  SET balance = balance + 500, welcome_credited_at = now(), updated_at = now()
  WHERE id = auth.uid() AND phone IS NOT NULL AND welcome_credited_at IS NULL
    AND created_at >= '2026-09-29 10:00:00+00'::timestamptz
  RETURNING balance INTO v_balance;
  IF v_balance IS NULL THEN
    SELECT balance INTO v_balance FROM public.profiles WHERE id = auth.uid();
  END IF;
  RETURN v_balance;
END;
$$;
REVOKE ALL ON FUNCTION app_private.claim_welcome_credit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.claim_welcome_credit() TO authenticated;
CREATE OR REPLACE FUNCTION public.claim_welcome_credit()
RETURNS numeric LANGUAGE sql SECURITY INVOKER SET search_path = public, app_private AS $$
  SELECT app_private.claim_welcome_credit();
$$;
GRANT EXECUTE ON FUNCTION public.claim_welcome_credit() TO authenticated;