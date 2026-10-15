import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import footballPromo from "@/assets/football-promo.jpg";
import { SectionBetslip } from "@/components/layout/SectionBetslip";
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
      <div className="reference-section-room"><div className="sportsbook-shell">
      <section className="reference-section-hero"><img src={footballPromo} alt="Football jackpot match day" width={1536} height={768} /><div className="reference-section-hero-copy"><h1 className="text-3xl font-extrabold">Crown Jackpots</h1><p className="text-success font-bold mt-3">Predict the matches. Compete for the prize.</p>{jps[0] && <p className="text-3xl font-extrabold text-gold mt-3">TZS {Number(jps[0].prize).toLocaleString()}</p>}</div></section>
      <div className="reference-section-columns"><nav className="reference-section-panel"><Link to="/jackpot" className="block px-4 py-3 bg-success text-success-foreground font-bold">Open jackpots</Link><Link to="/results" className="block px-4 py-3 text-sm">Match results</Link></nav><div className="space-y-3">
        {jps.length === 0 && <p className="text-center text-sm text-surface-dark-foreground/60 py-8">No live jackpots yet.</p>}
        {jps.map((j) => (
          <div key={j.id} className="reference-section-panel rounded-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <h2 className="font-extrabold text-surface-dark-foreground">{j.name}</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-bold">
                {counts[j.id] ?? 0} games
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-primary">
              TZS {Number(j.prize).toLocaleString()}
            </p>
            <p className="text-xs text-surface-dark-foreground/60">
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
      </div><SectionBetslip /></div></div></div>
    </AppLayout>
  );
};

export default Jackpot;
