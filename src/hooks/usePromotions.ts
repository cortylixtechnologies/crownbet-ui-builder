import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Promotion = {
  id: string;
  title: string;
  color: string;
  emoji: string;
  to_url: string;
  active: boolean;
  sort_order: number;
};

export const usePromotions = (onlyActive = true) => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    let q = supabase.from("promotions").select("*").order("sort_order");
    if (onlyActive) q = q.eq("active", true);
    const { data } = await q;
    setPromos((data ?? []) as Promotion[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("promos-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "promotions" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive]);

  return { promos, loading, reload: load };
};
