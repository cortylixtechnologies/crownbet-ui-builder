// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// TheSportsDB FREE endpoints: eventsnextleague is patron-only and was returning
// nothing for us. eventsday.php with the free test key "3" returns ALL events
// for a given date and sport — we filter to our target leagues client-side.
const TSDB_KEY = "3";

const TARGET_LEAGUES = new Set<string>([
  "English Premier League",
  "Spanish La Liga",
  "German Bundesliga",
  "Italian Serie A",
  "French Ligue 1",
  "UEFA Champions League",
  "UEFA Europa League",
  "English League Championship",
  "Portuguese Primeira Liga",
  "Dutch Eredivisie",
]);

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "20:00");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let imported = 0, skipped = 0, updated = 0, fetched = 0;
    const daysAhead = 14;
    const today = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() + i);
      const dateStr = fmtDate(d);
      const url = `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php?d=${dateStr}&s=Soccer`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const json: any = await r.json();
      const events: any[] = json?.events ?? [];
      fetched += events.length;

      for (const ev of events) {
        if (!TARGET_LEAGUES.has(ev.strLeague)) { skipped++; continue; }
        if (!ev.strHomeTeam || !ev.strAwayTeam) { skipped++; continue; }

        const externalId = `tsdb_${ev.idEvent}`;
        const row = {
          external_id: externalId,
          league: ev.strLeague,
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
          await supabase.from("matches").update({
            league: row.league, home: row.home, away: row.away,
            match_date: row.match_date, match_time: row.match_time,
          }).eq("id", existing.id);
          updated++;
        } else {
          const { error } = await supabase.from("matches").insert(row);
          if (error) skipped++; else imported++;
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, imported, updated, skipped, fetched, days: daysAhead }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
