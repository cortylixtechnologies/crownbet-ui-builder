import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match, mapDbMatch } from "@/data/mockData";

export const useMatches = (filter?: { live?: boolean }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    let q = supabase.from("matches").select("*").order("created_at", { ascending: false });
    if (filter?.live !== undefined) q = q.eq("live", filter.live);
    const { data } = await q;
    setMatches((data ?? []).map(mapDbMatch));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("matches-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.live]);

  return { matches, loading, reload: load };
};
