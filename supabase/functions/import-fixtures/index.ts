// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TSDB_KEY = "3";

// Map our internal sport names -> TheSportsDB `s=` query value
const SPORT_TO_TSDB: Record<string, string> = {
  soccer: "Soccer",
  basketball: "Basketball",
  "ice hockey": "Ice_Hockey",
  "american football": "American_Football",
  baseball: "Baseball",
  tennis: "Tennis",
  motorsport: "Motorsport",
  fighting: "Fighting",
  rugby: "Rugby",
  cricket: "Cricket",
  esports: "ESports",
};

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "20:00");

// Default odds per sport (placeholder; admin sets real odds)
const defaultOdds = (sport: string) => {
  switch (sport) {
    case "tennis":
    case "basketball":
    case "american football":
    case "baseball":
    case "ice hockey":
      return { home: 1.85, draw: null as any, away: 1.85 };
    default:
      return { home: 2.0, draw: 3.2, away: 3.5 };
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load active sports/leagues from config
    const { data: cfg, error: cfgErr } = await supabase
      .from("sports_config").select("*").eq("active", true);
    if (cfgErr) throw cfgErr;

    // Group by sport -> set of league IDs + hint names
    const sportsMap = new Map<string, { ids: Set<string>; names: Set<string> }>();
    for (const c of cfg ?? []) {
      const s = (c.sport as string).toLowerCase();
      if (!sportsMap.has(s)) sportsMap.set(s, { ids: new Set(), names: new Set() });
      const bucket = sportsMap.get(s)!;
      if (c.league_external_id) bucket.ids.add(String(c.league_external_id));
      if (c.league_name) bucket.names.add(String(c.league_name).toLowerCase());
    }

    let imported = 0, updated = 0, skipped = 0, fetched = 0, matched = 0;
    const reasons: Record<string, number> = {};
    const bump = (k: string) => { reasons[k] = (reasons[k] ?? 0) + 1; };
    const seenLeagues = new Set<string>();
    const daysAhead = 10;
    const today = new Date();

    for (const [sport, { ids, names }] of sportsMap) {
      const tsdbSport = SPORT_TO_TSDB[sport];
      if (!tsdbSport) { bump(`unsupported_sport_${sport}`); continue; }

      for (let i = 0; i < daysAhead; i++) {
        const d = new Date(today);
        d.setUTCDate(today.getUTCDate() + i);
        const dateStr = fmtDate(d);
        const url = `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php?d=${dateStr}&s=${tsdbSport}`;
        let r: Response;
        try { r = await fetch(url); } catch { bump("fetch_error"); continue; }
        if (!r.ok) { bump(`http_${r.status}`); continue; }
        const json: any = await r.json().catch(() => ({}));
        const events: any[] = json?.events ?? [];
        fetched += events.length;

        for (const ev of events) {
          const leagueName: string = ev.strLeague ?? "";
          const leagueId: string = String(ev.idLeague ?? "");
          seenLeagues.add(`${sport}|${leagueId}|${leagueName}`);

          const nameLower = leagueName.toLowerCase();
          const passesId = ids.has(leagueId);
          const passesName = Array.from(names).some((n) => nameLower.includes(n));
          if (!passesId && !passesName) { bump(`league_filtered_${sport}`); skipped++; continue; }
          if (!ev.strHomeTeam || !ev.strAwayTeam) { bump("missing_teams"); skipped++; continue; }

          matched++;
          const externalId = `tsdb_${ev.idEvent}`;
          const odds = defaultOdds(sport);
          const row: any = {
            sport,
            external_id: externalId,
            league: leagueName || sport,
            home: ev.strHomeTeam,
            away: ev.strAwayTeam,
            match_date: ev.dateEvent || dateStr,
            match_time: fmtTime(ev.strTime),
            odds_home: odds.home,
            odds_draw: odds.draw ?? 0,
            odds_away: odds.away,
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
              sport: row.sport, league: row.league,
              home: row.home, away: row.away,
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
    }

    return new Response(
      JSON.stringify({
        ok: true,
        imported, updated, skipped, fetched, matched,
        sports: Array.from(sportsMap.keys()),
        days: daysAhead,
        reasons,
        seen_leagues_sample: Array.from(seenLeagues).slice(0, 60),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
