
# Expand games library + admin management

Big build, split into 4 phases so each is shippable on its own. All new RNG runs server-side (same pattern as `play_coinflip`, `play_dice`, etc.) so the existing security model holds.

---

## Phase 1 — More sports (TheSportsDB)

Extend the existing `import-fixtures` edge function to pull additional sports instead of soccer-only.

- Add sport filter: `soccer`, `basketball`, `tennis`, `ice hockey`, `american football`, `baseball`, `cricket`, `rugby`, `motorsport`, `esports`.
- Add `sport text` column to `matches` (default `'soccer'`); backfill existing rows.
- Add `markets jsonb` column to `matches` for sports that aren't 1X2 (tennis = 2-way, basketball = with handicap, etc.). Football keeps using `odds_home/draw/away`.
- `AdminMatches.tsx`: add **Sport** filter dropdown alongside league/source filters; show sport badge on each row.
- Public `League.tsx` / home: group matches by sport tab.

Imported leagues per sport are configurable from a new `sports_config` table (admin-editable in Phase 2 Categories Manager).

---

## Phase 2 — Virtuals suite (server-scheduled)

New module — fully simulated, runs 24/7, no external API.

**Schema**
- `virtual_games` — `code` (vfootball / vhorses / vgreyhounds / vpenalty / vinstant_football), `display_name`, `round_seconds`, `active`, `rtp`.
- `virtual_rounds` — `game_code`, `round_no`, `starts_at`, `ends_at`, `status` (`upcoming`/`betting`/`running`/`settled`), `result jsonb`, `seed`.
- `virtual_participants` — per round: name, odds, finishing_position (set on settlement).
- `virtual_bets` — `user_id`, `round_id`, `pick`, `stake`, `odd`, `status`, `payout`.

**Server logic** (SECURITY DEFINER RPCs)
- `vg_place_bet(round_id, pick, stake)` — odds looked up server-side.
- `vg_settle_round(round_id)` — generates result with seeded RNG, pays winners.
- Edge function `virtuals-scheduler` invoked by `pg_cron` every minute: closes betting, runs settlement, creates next round per game.

**UI**
- `src/pages/virtuals/VirtualFootball.tsx`, `VirtualHorses.tsx`, `VirtualGreyhounds.tsx`, `VirtualPenalty.tsx`, `InstantFootball.tsx` — countdown, participants, betslip, live animation (CSS only).
- Wire from existing `Virtuals.tsx` grid.

---

## Phase 3 — Casino + Lottery + Jackpot

**Casino RNG games** — same pattern as `play_dice`:
- `play_roulette(stake, bets jsonb)` — European wheel, server spins.
- `play_blackjack_*` — `start/hit/stand/double` round-based RPCs with `blackjack_rounds` table.
- `play_baccarat(stake, side)` — server deals.
- `play_plinko(stake, risk, rows)`, `play_limbo(stake, target)`, `play_hilo_*`, `play_keno(stake, picks)`, `play_tower_*`.

Pages under `src/pages/games/`, registered in `games` table so `AdminGames` controls them.

**Lottery**
- `lottery_draws` (draw_no, type 5/90 or 6/49, draw_at, winning_numbers, status).
- `lottery_tickets` (user, draw, picks, stake, prize, status).
- Cron settles draw and pays tiered prizes.

**Jackpot pools**
- `jackpots` — name, prize, entry_fee, deadline, match_count, status, rules.
- `jackpot_matches` — link to `matches`.
- `jackpot_entries` — user picks, correct_count, prize.
- Auto-evaluates when all linked matches finish.

---

## Phase 4 — Admin management

**Categories & game settings** (`AdminGames` upgrade)
- Add `game_categories` table (name, slug, sort, icon, active) — replaces hardcoded category strings.
- Extend `games` row: `rtp`, `min_stake`, `max_stake`, `house_edge`, `maintenance`, `thumbnail_url`, `category_id`.
- New `AdminCategories.tsx` for CRUD + reorder.
- `AdminGames.tsx`: per-game settings drawer (RTP, stake caps, thumbnail upload to a new `game-thumbnails` storage bucket, maintenance toggle).

**Virtuals scheduler** (`AdminVirtuals.tsx`)
- List virtual games, edit round duration, pause/resume, see next round time, force-settle button.

**Jackpot builder** (`AdminJackpots.tsx`)
- Create jackpot, pick approved matches via match-search modal, set prize/entry fee/deadline, view entries leaderboard, manual settle.

**Reports** (`AdminReports.tsx`)
- GGR per game (stake - payout grouped by `game_transactions.game` + virtuals + bets).
- Top winners / top losers (date range filter).
- Game transactions table with filters (game, user, date, min net).
- CSV export.

**Risk controls** (`AdminRisk.tsx` + `risk_settings` table)
- Global max win cap, per-game stake caps (already in game row), per-user daily loss limit, per-user max active bets.
- Enforced inside `place_bet`, `play_*`, `vg_place_bet` RPCs.
- Suspicious-pattern flag list (auto-flag rules: rapid-fire bets, win-rate > threshold) → `risk_flags` table, admin can ban/freeze.

**Audit log** (`audit_log` table + `AdminAudit.tsx`)
- Logs every admin write (approve match, change odds, adjust balance, change settings, settle jackpot).
- Insertion via a `log_admin_action()` helper called inside admin RPCs and from `AdminLayout` for client-side writes.
- Read-only UI with filter by admin / action / date.

---

## Suggested order

I'd ship in this order so each phase is usable on its own:

```text
P1 sports importer        →  immediate value, low risk
P4 categories + settings  →  needed to organize new games coming next
P2 virtuals suite         →  biggest revenue add-on
P3 casino/lottery/jackpot →  largest surface area, do last
P4 reports/risk/audit     →  layered in alongside P2/P3
```

If you want everything in one go I'll do it, but it'll be a very large set of migrations and files. **Reply with which phase(s) to start with** (e.g. "P1+P4 first" or "do all") and I'll begin.
