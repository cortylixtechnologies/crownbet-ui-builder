import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match, mapDbMatch, localISODate } from "@/data/mockData";

// Only published fixtures that are live or not yet in the past, soonest first.
export const useMatches = (filter?: { live?: boolean }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    let q = supabase.from("matches").select("*").eq("approved", true)
      .order("match_date", { ascending: true }).order("match_time", { ascending: true });
    if (filter?.live !== undefined) q = q.eq("live", filter.live);
    const { data } = await q;
    const today = localISODate();
    const rows = (data ?? []).filter((r: any) =>
      r.live || !/^\d{4}-\d{2}-\d{2}$/.test(r.match_date) || r.match_date >= today,
    );
    setMatches(rows.map(mapDbMatch));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`matches-changes-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.live]);

  return { matches, loading, reload: load };
};
