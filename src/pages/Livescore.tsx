import { AppLayout } from "@/components/layout/AppLayout";
import { useMatches } from "@/hooks/useMatches";
import { Activity } from "lucide-react";

const Livescore = () => {
  const { matches } = useMatches({ live: true });
  return (
    <AppLayout>
      <div className="bg-surface-dark text-surface-dark-foreground px-4 py-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-success" />
        <h1 className="text-2xl font-extrabold">Livescore</h1>
        <span className="ml-auto text-sm text-white/60">{matches.length} live</span>
      </div>
      <div className="bg-card divide-y divide-border">
        {matches.map((m) => (
          <div key={m.id} className="px-4 py-3">
            <div className="text-xs text-muted-foreground mb-1">{m.league}</div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-foreground">{m.home}</div>
                <div className="font-bold text-foreground">{m.away}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-success">{m.score}</div>
                <div className="text-[11px] text-muted-foreground">{m.minute}</div>
              </div>
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No live matches.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default Livescore;
