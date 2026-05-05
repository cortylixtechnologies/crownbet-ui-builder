import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bookmark, ChevronUp, Share2, TrendingUp } from "lucide-react";
import { recommendedCodes } from "@/data/mockData";
import { toast } from "sonner";

const OpenBets = () => {
  const [tab, setTab] = useState<"open" | "history">("open");

  return (
    <AppLayout hideHeader>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-end gap-3 text-sm font-bold">
        <Link to="/register" className="hover:underline">Register</Link>
        <span className="text-white/40">|</span>
        <Link to="/login" className="hover:underline">Login</Link>
      </div>

      {/* Tabs */}
      <div className="bg-surface-dark text-white grid grid-cols-2">
        {(["open", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-4 text-base font-bold ${
              tab === t ? "bg-card text-foreground" : "text-white/80"
            }`}
          >
            {t === "open" ? "Open Bets" : "Bet History"}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-card py-12 px-6 text-center">
        <p className="text-foreground font-medium leading-relaxed">
          Please Log In to see your Open Bets<br />and Cashout Bets
        </p>
        <Link
          to="/login"
          className="inline-block mt-6 px-10 py-2.5 border-2 border-success text-success rounded font-bold"
        >
          Login
        </Link>
      </div>

      {/* Recommended codes */}
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
              <button
                onClick={() => toast.success("Share link copied")}
                className="flex items-center justify-center gap-2 py-3 bg-secondary text-success font-bold text-sm"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={() => toast.success(`Code ${c.code} added`)}
                className="flex items-center justify-center gap-2 py-3 bg-success text-success-foreground font-bold text-sm"
              >
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
