// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// TheSportsDB league IDs (free API, no key required)
const LEAGUES = [
  { id: 4328, name: "English Premier League" },
  { id: 4335, name: "Spanish La Liga" },
  { id: 4331, name: "German Bundesliga" },
  { id: 4332, name: "Italian Serie A" },
  { id: 4334, name: "French Ligue 1" },
  { id: 4480, name: "UEFA Champions League" },
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

    let imported = 0, skipped = 0, updated = 0;

    for (const league of LEAGUES) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${league.id}`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const json: any = await r.json();
      const events: any[] = json?.events ?? [];

      for (const ev of events) {
        const externalId = `tsdb_${ev.idEvent}`;
        const row = {
          external_id: externalId,
          league: ev.strLeague || league.name,
          home: ev.strHomeTeam,
          away: ev.strAwayTeam,
          match_date: ev.dateEvent || fmtDate(new Date()),
          match_time: fmtTime(ev.strTime),
          odds_home: 2.0,
          odds_draw: 3.2,
          odds_away: 3.5,
          live: false,
          hot: false,
          approved: false,
          source: "thesportsdb",
        };
        if (!row.home || !row.away) { skipped++; continue; }

        const { data: existing } = await supabase
          .from("matches").select("id, approved")
          .eq("external_id", externalId).maybeSingle();

        if (existing) {
          // Only refresh schedule fields; never touch approved or odds set by admin.
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
      JSON.stringify({ ok: true, imported, updated, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
