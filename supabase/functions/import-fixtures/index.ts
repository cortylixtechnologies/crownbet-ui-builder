// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// TheSportsDB free key "3" — eventsday returns ALL soccer events worldwide for
// the given date. We filter by league ID (much more reliable than name strings,
// which vary: "English Premier League" vs "Premier League" vs "EPL", etc.).
const TSDB_KEY = "3";

// Broad set of top + popular leagues across multiple confederations so we
// actually pull matches every day of the year.
const TARGET_LEAGUE_IDS = new Set<string>([
  "4328", // English Premier League
  "4329", // English League Championship
  "4396", // English League One
  "4335", // Spanish La Liga
  "4336", // Spanish Segunda
  "4331", // German Bundesliga
  "4332", // Italian Serie A
  "4334", // French Ligue 1
  "4337", // Dutch Eredivisie
  "4344", // Portuguese Primeira Liga
  "4346", // American MLS
  "4347", // Mexican Liga MX
  "4351", // Brazilian Serie A
  "4406", // Argentine Primera
  "4421", // Saudi Pro League
  "4480", // UEFA Champions League
  "4481", // UEFA Europa League
  "4482", // UEFA Conference League
  "4488", // Turkish Super Lig
  "4338", // Scottish Premiership
  "4399", // Belgian Pro League
  "4359", // Russian Premier
  "4422", // Chinese Super League
  "4350", // Japanese J1
  "4356", // Australian A-League
  "4502", // CONMEBOL Libertadores
  "4503", // CONMEBOL Sudamericana
  "4505", // CAF Champions League
  "4904", // FIFA World Cup
  "4429", // UEFA Nations League
  "4517", // EURO Qualifiers
]);

// Name-based fallback for events that have an unusual idLeague but a famous
// competition name — catches things like "FIFA World Cup", "AFCON" etc.
const NAME_HINTS = [
  "premier league","la liga","bundesliga","serie a","ligue 1","eredivisie",
  "primeira","mls","liga mx","libertadores","sudamericana","champions league",
  "europa","conference league","world cup","nations league","euro","afcon",
  "championship","saudi","super lig","j1","a-league","brasileir",
];

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "20:00");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let imported = 0, skipped = 0, updated = 0, fetched = 0, matched = 0;
    const reasons: Record<string, number> = {};
    const bump = (k: string) => { reasons[k] = (reasons[k] ?? 0) + 1; };

    const daysAhead = 14;
    const today = new Date();
    const seenLeagues = new Set<string>();

    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() + i);
      const dateStr = fmtDate(d);
      const url = `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php?d=${dateStr}&s=Soccer`;
      let r: Response;
      try { r = await fetch(url); } catch { bump("fetch_error"); continue; }
      if (!r.ok) { bump(`http_${r.status}`); continue; }
      const json: any = await r.json().catch(() => ({}));
      const events: any[] = json?.events ?? [];
      fetched += events.length;

      for (const ev of events) {
        const leagueName: string = ev.strLeague ?? "";
        const leagueId: string = String(ev.idLeague ?? "");
        seenLeagues.add(`${leagueId}|${leagueName}`);

        const nameLower = leagueName.toLowerCase();
        const passesId = TARGET_LEAGUE_IDS.has(leagueId);
        const passesName = NAME_HINTS.some((h) => nameLower.includes(h));
        if (!passesId && !passesName) { bump("league_filtered"); skipped++; continue; }
        if (!ev.strHomeTeam || !ev.strAwayTeam) { bump("missing_teams"); skipped++; continue; }

        matched++;
        const externalId = `tsdb_${ev.idEvent}`;
        const row = {
          external_id: externalId,
          league: leagueName || "Soccer",
          home: ev.strHomeTeam,
          away: ev.strAwayTeam,
          match_date: ev.dateEvent || dateStr,
          match_time: fmtTime(ev.strTime),
          odds_home: 2.0,
          odds_draw: 3.2,
          odds_away: 3.5,
          live: false,
          hot: false,
          approved: false,
          source: "thesportsdb",
        };

        const { data: existing } = await supabase
          .from("matches").select("id")
          .eq("external_id", externalId).maybeSingle();

        if (existing) {
          const { error } = await supabase.from("matches").update({
            league: row.league, home: row.home, away: row.away,
            match_date: row.match_date, match_time: row.match_time,
          }).eq("id", existing.id);
          if (error) { bump(`upd_${error.code ?? "err"}`); skipped++; }
          else updated++;
        } else {
          const { error } = await supabase.from("matches").insert(row);
          if (error) { bump(`ins_${error.code ?? "err"}`); skipped++; }
          else imported++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        imported, updated, skipped, fetched, matched,
        days: daysAhead,
        reasons,
        seen_leagues_sample: Array.from(seenLeagues).slice(0, 50),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
