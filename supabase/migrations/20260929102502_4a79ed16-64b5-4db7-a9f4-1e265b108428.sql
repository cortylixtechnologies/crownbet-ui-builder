ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text, ADD COLUMN IF NOT EXISTS welcome_credited_at timestamptz;
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 0;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, display_name, balance)
  VALUES (new.id, new.email, new.phone,
          COALESCE(NULLIF(new.raw_user_meta_data->>'display_name',''), NULLIF(new.phone,''), split_part(COALESCE(new.email,''),'@',1)), 0);
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  RETURN new;
END;
$$;
CREATE OR REPLACE FUNCTION public.claim_welcome_credit()
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
REVOKE ALL ON FUNCTION public.claim_welcome_credit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_welcome_credit() TO authenticated;