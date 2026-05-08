
-- trigger-only helpers: nobody should call directly
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;

-- has_role is used inside RLS — keep authenticated, drop anon/public
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

-- place_bet: only signed-in users
revoke execute on function public.place_bet(numeric, jsonb) from public, anon;
grant execute on function public.place_bet(numeric, jsonb) to authenticated;
