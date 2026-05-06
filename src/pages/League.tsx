import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { ChevronLeft, Trophy } from "lucide-react";
import { featuredMatches, liveMatches, sportsCatalog, slugify } from "@/data/mockData";

const League = () => {
  const { slug = "" } = useParams();

  const leagueName = useMemo(() => {
    for (const sport of sportsCatalog) {
      const found = sport.leagues.find((l) => slugify(l) === slug);
      if (found) return found;
    }
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [slug]);

  const matches = useMemo(() => {
    const all = [...featuredMatches, ...liveMatches];
    const filtered = all.filter((m) => slugify(m.league) === slug || m.league.toLowerCase().includes(leagueName.toLowerCase().split(" ")[0]));
    return filtered.length ? filtered : all.slice(0, 4);
  }, [slug, leagueName]);

  return (
    <AppLayout>
      <div className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <Link to="/menu" className="inline-flex items-center gap-1 text-sm font-medium opacity-90 hover:opacity-100">
          <ChevronLeft className="w-4 h-4" /> Back to A-Z menu
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-extrabold">{leagueName}</h1>
        </div>
        <p className="mt-1 text-sm opacity-80">{matches.length} match{matches.length !== 1 ? "es" : ""} available</p>
      </div>

      <div className="px-3 py-3 space-y-3">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </AppLayout>
  );
};

export default League;
