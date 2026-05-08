import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { ChevronLeft, Trophy } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { sportsCatalog, slugify } from "@/data/mockData";

const League = () => {
  const { slug = "" } = useParams();
  const { matches } = useMatches();

  const leagueName = useMemo(() => {
    for (const sport of sportsCatalog) {
      const found = sport.leagues.find((l) => slugify(l) === slug);
      if (found) return found;
    }
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [slug]);

  const filtered = useMemo(() => {
    const exact = matches.filter((m) => slugify(m.league) === slug);
    if (exact.length) return exact;
    const t = leagueName.toLowerCase().split(" ")[0];
    const fuzzy = matches.filter((m) => m.league.toLowerCase().includes(t));
    return fuzzy.length ? fuzzy : matches.slice(0, 4);
  }, [slug, leagueName, matches]);

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
        <p className="mt-1 text-sm opacity-80">{filtered.length} match{filtered.length !== 1 ? "es" : ""} available</p>
      </div>

      <div className="px-3 py-3 space-y-3">
        {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </AppLayout>
  );
};

export default League;
