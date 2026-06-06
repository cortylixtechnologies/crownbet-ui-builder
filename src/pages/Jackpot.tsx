import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Trophy, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type JP = { id: string; name: string; prize: number; entry_fee: number; deadline: string; status: string };

const Jackpot = () => {
  const [jps, setJps] = useState<JP[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jackpots").select("*")
        .eq("status", "open").order("deadline", { ascending: true });
      const list = (data ?? []) as JP[];
      setJps(list);
      if (list.length) {
        const { data: jpm } = await supabase.from("jackpot_matches").select("jackpot_id")
          .in("jackpot_id", list.map((j) => j.id));
        const c: Record<string, number> = {};
        (jpm ?? []).forEach((x: any) => { c[x.jackpot_id] = (c[x.jackpot_id] ?? 0) + 1; });
        setCounts(c);
      }
    })();
  }, []);

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 text-white px-4 py-8 text-center">
        <Trophy className="w-12 h-12 text-gold mx-auto" />
        <h1 className="text-3xl font-extrabold mt-2">Crown Jackpots</h1>
        <p className="mt-1 text-sm text-white/80">Predict every match. Win it all.</p>
      </div>
      <div className="p-3 space-y-3">
        {jps.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No live jackpots yet.</p>}
        {jps.map((j) => (
          <div key={j.id} className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <h2 className="font-extrabold text-foreground">{j.name}</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-bold">
                {counts[j.id] ?? 0} games
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-primary">
              TZS {Number(j.prize).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Entry TZS {Number(j.entry_fee).toLocaleString()} · Closes {new Date(j.deadline).toLocaleString()}
            </p>
            <Link
              to={`/jackpot/${j.id}`}
              className="mt-3 block text-center bg-gradient-primary text-primary-foreground font-bold py-3 rounded-lg"
            >
              Play now
            </Link>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Jackpot;
