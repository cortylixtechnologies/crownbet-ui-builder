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

// Free, keyless ESPN scoreboards (second source) — sport, path, label
const ESPN_LEAGUES: [string, string, string][] = [
  ["soccer", "soccer/eng.1", "England Premier League"],
  ["soccer", "soccer/eng.2", "England Championship"],
  ["soccer", "soccer/esp.1", "Spain La Liga"],
  ["soccer", "soccer/ita.1", "Italy Serie A"],
  ["soccer", "soccer/ger.1", "Bundesliga"],
  ["soccer", "soccer/fra.1", "France Ligue 1"],
  ["soccer", "soccer/ned.1", "Eredivisie"],
  ["soccer", "soccer/por.1", "Primeira Liga"],
  ["soccer", "soccer/usa.1", "MLS"],
  ["soccer", "soccer/ksa.1", "Saudi Pro League"],
  ["soccer", "soccer/uefa.champions", "Champions League"],
  ["soccer", "soccer/uefa.europa", "Europa League"],
  ["soccer", "soccer/uefa.europa.conf", "Conference League"],
  ["soccer", "soccer/fifa.worldq.uefa", "World Cup Qualifiers UEFA"],
  ["soccer", "soccer/fifa.worldq.caf", "World Cup Qualifiers CAF"],
  ["soccer", "soccer/fifa.friendly", "International Friendlies"],
  ["basketball", "basketball/nba", "NBA"],
  ["basketball", "basketball/wnba", "WNBA"],
  ["ice hockey", "hockey/nhl", "NHL"],
  ["american football", "football/nfl", "NFL"],
  ["american football", "football/college-football", "NCAA Football"],
  ["baseball", "baseball/mlb", "MLB"],
  ["tennis", "tennis/atp", "ATP"],
  ["tennis", "tennis/wta", "WTA"],
];

// Convert an ISO UTC timestamp into Dar es Salaam (UTC+3) date + time
const toEAT = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 3 * 3600_000);
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
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
    let body: any = {};
    try { body = await req.json(); } catch { /* cron call without body */ }
    const startStr = /^\d{4}-\d{2}-\d{2}$/.test(body?.date ?? "") ? body.date : toEAT(new Date().toISOString()).date;
    const daysAhead = Math.min(Math.max(Number(body?.days) || 3, 1), 10);
    const today = new Date(`${startStr}T00:00:00Z`);
    const sources: string[] = Array.isArray(body?.sources) ? body.sources : ["thesportsdb", "espn"];

    const upsert = async (row: any) => {
      const { data: existing } = await supabase.from("matches").select("id").eq("external_id", row.external_id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("matches").update({
          league: row.league, home: row.home, away: row.away, match_date: row.match_date, match_time: row.match_time,
        }).eq("id", existing.id);
        if (error) { bump(`upd_${error.code ?? "err"}`); skipped++; } else updated++;
      } else {
        const { error } = await supabase.from("matches").insert(row);
        if (error) { bump(`ins_${error.code ?? "err"}`); skipped++; } else imported++;
      }
    };

    if (sources.includes("espn")) {
      for (let i = 0; i < daysAhead; i++) {
        const d = new Date(today); d.setUTCDate(today.getUTCDate() + i);
        const ymd = fmtDate(d).replace(/-/g, "");
        await Promise.all(ESPN_LEAGUES.map(async ([sport, path, label]) => {
          try {
            const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard?dates=${ymd}`);
            if (!r.ok) { bump(`espn_http_${r.status}`); return; }
            const j: any = await r.json();
            for (const ev of j?.events ?? []) {
              fetched++;
              const comps = ev?.competitions ?? [];
              for (const c of comps) {
                const state = c?.status?.type?.state ?? ev?.status?.type?.state;
                if (state === "post") { bump("espn_finished"); continue; }
                const teams = c?.competitors ?? [];
                const h = teams.find((t: any) => t.homeAway === "home") ?? teams[0];
                const a = teams.find((t: any) => t.homeAway === "away") ?? teams[1];
                const name = (t: any) => t?.team?.displayName ?? t?.athlete?.displayName ?? t?.athlete?.fullName;
                if (!name(h) || !name(a)) { bump("espn_missing_teams"); continue; }
                const when = toEAT(c?.date ?? ev.date);
                const odds = defaultOdds(sport);
                matched++;
                await upsert({
                  sport, external_id: `espn_${c?.id ?? ev.id}`, league: label,
                  home: name(h), away: name(a), match_date: when.date, match_time: when.time,
                  odds_home: odds.home, odds_draw: odds.draw ?? 0, odds_away: odds.away,
                  live: false, hot: false, approved: false, source: "espn",
                });
              }
            }
          } catch { bump("espn_fetch_error"); }
        }));
      }
    }

    if (!sources.includes("thesportsdb")) sportsMap.clear();

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
