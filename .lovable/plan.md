# Plan

## 1. Auto-import football fixtures

**Data source:** TheSportsDB free API (no key, no signup). Pulls upcoming fixtures for major leagues (EPL, La Liga, Serie A, Bundesliga, Ligue 1, Champions League). Easy to swap later.

**Schema additions on `matches`:**
- `external_id text unique` — TheSportsDB event id, prevents duplicates on re-imports
- `approved boolean default false` — only approved matches are visible to users
- `source text default 'manual'` — `'thesportsdb'` for imported rows
- Public `anyone read matches` policy tightened to `approved = true OR live = true`
- Manually-added matches default to `approved = true`

**Edge function `import-fixtures`** (verify_jwt off, callable by cron + admin):
- Fetches next 14 days of fixtures for the configured leagues from TheSportsDB
- Upserts into `matches` with `approved=false`, placeholder odds (2.0/3.2/3.5), `source='thesportsdb'`
- Returns counts of imported / skipped / updated

**Scheduled run:** `pg_cron` + `pg_net` job invokes the edge function every 6 hours.

**Admin UI (`AdminMatches.tsx`):**
- Tabs: "Pending Approval" (imported, not approved) and "Live/Published"
- Inline odds editor (already there) + "Approve & Publish" button → sets `approved=true`
- "Run Import Now" button to trigger the edge function on demand

**User-facing pages:** `useMatches` already reads from `matches` — it'll filter to approved rows automatically via RLS, no code change needed.

## 2. Security fixes

**Error: client-supplied betting odds**
Rewrite `place_bet` to look up `odds_home/draw/away` from the `matches` row using each selection's `match_id` + `pick`. Ignore client-sent odd. Reject if `match_id` is null, match doesn't exist, isn't approved, or `live=false` and kickoff has passed (best-effort).

**Error: users can update own balance**
Replace the broad `users update own profile` policy with one that blocks balance changes: `WITH CHECK (balance = (SELECT balance FROM profiles WHERE id = auth.uid()))`. Balance only mutates via SECURITY DEFINER RPCs.

**Error: client-controlled casino payouts**
Move all RNG server-side. Drop the old `play_game(_payout, …)` RPC. Add per-game SECURITY DEFINER RPCs that accept only inputs and compute outcomes with `random()`:
- `play_coinflip(stake, pick)` — server flips
- `play_dice(stake, target, over)` — server rolls, multiplier from win-chance
- `play_wheel(stake)` — server picks segment from a fixed table baked into the function
- `play_mines_start(stake, mines_count)` → returns round id with hidden mine layout
- `play_mines_pick(round_id, tile)` → reveals tile, returns hit/miss/multiplier
- `play_mines_cashout(round_id)` → pays current multiplier
- `play_aviator_round()` — creates a round with a hidden seeded crash point (server-only)
- `play_aviator_bet(round_id, stake)` and `play_aviator_cashout(round_id, multiplier)` — pays only if multiplier ≤ crash
Frontend keeps its visuals/animations but now reads outcomes from server responses.

**Warning: hardcoded admin email**
Drop the email branch from `handle_new_user`. Remove the "register with admin email" hint from `AdminLogin.tsx`. Existing admin row preserved.

**Warning: SECURITY DEFINER executable by anon/authenticated (linter)**
`REVOKE EXECUTE … FROM PUBLIC, anon` on every SECURITY DEFINER function, then `GRANT EXECUTE … TO authenticated` only on user-facing RPCs (`place_bet`, `play_*`). `has_role`, `handle_new_user`, `update_updated_at_column` stay internal — no grants.

## Files touched

- `supabase/migrations/<new>.sql` — schema, policies, all RPCs, grants, cron job
- `supabase/functions/import-fixtures/index.ts` — new edge function
- `src/pages/admin/AdminMatches.tsx` — Pending/Published tabs, approve button, run-import button
- `src/pages/admin/AdminLogin.tsx` — remove admin-email hint
- `src/hooks/usePlayGame.ts` — replaced by per-game helpers
- `src/pages/games/{CoinFlip,Dice,Wheel,Mines,Aviator}.tsx` — call new RPCs, trust server result

## Out of scope (say so if you want them)

- New Virtuals / Instants games (you dropped this from the latest message)
- Auto-settlement of bets when matches finish — admin still settles manually
- Live score sync from API
