import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useMatches } from "@/hooks/useMatches";

const Live = () => {
  const { matches } = useMatches({ live: true });
  return (
    <AppLayout>
      <div className="bg-surface-dark text-surface-dark-foreground px-4 py-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live Now
          <span className="ml-auto text-sm font-medium text-white/60">{matches.length} matches</span>
        </h1>
      </div>
      <div className="px-3 py-3 space-y-3">
        {matches.map((m) => <MatchCard key={m.id} match={m} />)}
        {matches.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No live matches right now.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default Live;
