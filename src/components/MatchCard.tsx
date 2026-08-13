import { Flame, TrendingUp } from "lucide-react";
import { Match } from "@/data/mockData";
import { useBetslip } from "@/context/BetslipContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { toast } from "sonner";

export const MatchCard = ({ match }: { match: Match }) => {
  const { addSelection, selections } = useBetslip();
  const { requireAuth } = useAuthGate();

  const pick = (key: "home" | "draw" | "away", label: string, odd: number) => {
    requireAuth(() => {
      addSelection({
        id: `${match.id}-${key}`,
        matchId: match.id,
        match: `${match.home} vs ${match.away}`,
        market: "1X2",
        pick: label,
        odd,
      });
      toast.success("Added to betslip", { description: `${match.home} vs ${match.away} — ${label} @ ${odd.toFixed(2)}` });
    }, "Sign up or log in to add this selection to your betslip.");
  };


  const isPicked = (key: string) => selections.some((s) => s.id === `${match.id}-${key}`);

  const teamInitial = (n: string) => n.slice(0, 2).toUpperCase();

  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {match.hot && (
            <span className="flex items-center gap-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">
              HOT <Flame className="w-3 h-3" />
            </span>
          )}
          <span className="truncate text-accent font-medium">Football · {match.league}</span>
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-3 items-center px-3 py-3 gap-2">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
            {teamInitial(match.home)}
          </div>
          <span className="text-xs font-medium text-foreground line-clamp-1">{match.home}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          {match.live ? (
            <>
              <div className="text-lg font-bold">{match.score}</div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="bg-success text-success-foreground px-1.5 py-0.5 rounded font-bold">LIVE</span>
                <span className="text-muted-foreground">{match.minute}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-foreground">{match.time}</div>
              <div className="text-[11px] text-muted-foreground">{match.date}</div>
            </>
          )}
          <div className="text-xs font-bold text-success mt-1">1X2</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-10 h-10 rounded-full bg-surface-dark text-surface-dark-foreground font-bold flex items-center justify-center text-sm">
            {teamInitial(match.away)}
          </div>
          <span className="text-xs font-medium text-foreground line-clamp-1">{match.away}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 bg-secondary">
        {(["home", "draw", "away"] as const).map((k, i) => {
          const labels = ["1", "X", "2"];
          const odds = [match.odds.home, match.odds.draw, match.odds.away];
          const picked = isPicked(k);
          return (
            <button
              key={k}
              onClick={() => pick(k, labels[i], odds[i])}
              className={`flex items-center justify-between px-3 py-2.5 rounded transition ${
                picked
                  ? "bg-success text-success-foreground"
                  : "bg-success/10 text-success hover:bg-success/20"
              }`}
            >
              <span className="text-xs font-medium opacity-80">{labels[i]}</span>
              <span className="text-sm font-bold">{odds[i].toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
