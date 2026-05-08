import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, ChevronUp, Share2, TrendingUp } from "lucide-react";
import { recommendedCodes } from "@/data/mockData";
import { toast } from "sonner";

type BetWithSelections = {
  id: string;
  stake: number;
  total_odds: number;
  potential_win: number;
  status: string;
  placed_at: string;
  bet_selections: { id: string; match_label: string; market: string; pick: string; odd: number }[];
};

const OpenBets = () => {
  const { session } = useAuth();
  const [tab, setTab] = useState<"open" | "history">("open");
  const [bets, setBets] = useState<BetWithSelections[]>([]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("bets")
      .select("*, bet_selections(*)")
      .order("placed_at", { ascending: false })
      .then(({ data }) => setBets((data ?? []) as any));
  }, [session]);

  const visible = bets.filter((b) => (tab === "open" ? b.status === "pending" : b.status !== "pending"));

  return (
    <AppLayout hideHeader>
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-end gap-3 text-sm font-bold">
        {!session && (
          <>
            <Link to="/register" className="hover:underline">Register</Link>
            <span className="text-white/40">|</span>
            <Link to="/login" className="hover:underline">Login</Link>
          </>
        )}
      </div>

      <div className="bg-surface-dark text-white grid grid-cols-2">
        {(["open", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-4 text-base font-bold ${tab === t ? "bg-card text-foreground" : "text-white/80"}`}>
            {t === "open" ? "Open Bets" : "Bet History"}
          </button>
        ))}
      </div>

      {!session ? (
        <div className="bg-card py-12 px-6 text-center">
          <p className="text-foreground font-medium leading-relaxed">
            Please Log In to see your<br />Open Bets and History
          </p>
          <Link to="/login" className="inline-block mt-6 px-10 py-2.5 border-2 border-success text-success rounded font-bold">
            Login
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-card py-12 px-6 text-center text-muted-foreground">
          No {tab === "open" ? "open" : "settled"} bets yet.
        </div>
      ) : (
        <div className="bg-secondary px-3 py-3 space-y-2">
          {visible.map((b) => (
            <div key={b.id} className="bg-card rounded-lg p-3 shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{new Date(b.placed_at).toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.status === "won" ? "bg-success text-success-foreground" :
                  b.status === "lost" ? "bg-destructive text-destructive-foreground" :
                  "bg-muted text-foreground"
                }`}>{b.status.toUpperCase()}</span>
              </div>
              <div className="divide-y divide-border">
                {b.bet_selections.map((s) => (
                  <div key={s.id} className="py-2 text-sm">
                    <div className="font-bold text-foreground">{s.match_label}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.market} · {s.pick} @ {Number(s.odd).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-border">
                <div><div className="text-muted-foreground">Stake</div><div className="font-bold">TZS {Number(b.stake).toLocaleString()}</div></div>
                <div><div className="text-muted-foreground">Odds</div><div className="font-bold">{Number(b.total_odds).toFixed(2)}</div></div>
                <div><div className="text-muted-foreground">Potential</div><div className="font-bold text-success">TZS {Number(b.potential_win).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-secondary px-3 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-success rounded flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-white fill-white" />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">Recommended Football Codes</h2>
          </div>
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        </div>

        {recommendedCodes.map((c) => (
          <div key={c.code} className="bg-card rounded-lg overflow-hidden shadow-card">
            <div className="bg-success/10 px-4 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-bold">
                <span className="text-foreground">{c.code}</span>
                <span className="flex items-center gap-1 text-success">
                  <span className="bg-success text-success-foreground text-[10px] px-1 py-0.5 rounded">📋</span>
                  {c.plays}
                </span>
              </div>
              <div className="text-muted-foreground">Folds: <span className="font-bold text-foreground">{c.folds}</span></div>
              <div className="text-muted-foreground">Odds: <span className="font-bold text-foreground">{c.odds.toFixed(2)}</span></div>
            </div>
            <div className="divide-y divide-border">
              {c.bets.map((b, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="text-gold">🏆</span>
                      {b.pick} @{b.odd.toFixed(2)}
                      <span className="text-muted-foreground font-normal">| {b.market}</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span className="truncate">{b.home} vs {b.away}</span>
                    <span className="shrink-0 ml-2">{b.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2">
              <button onClick={() => toast.success("Share link copied")}
                className="flex items-center justify-center gap-2 py-3 bg-secondary text-success font-bold text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button onClick={() => toast.success(`Code ${c.code} added`)}
                className="flex items-center justify-center gap-2 py-3 bg-success text-success-foreground font-bold text-sm">
                Add to Betslip
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default OpenBets;
