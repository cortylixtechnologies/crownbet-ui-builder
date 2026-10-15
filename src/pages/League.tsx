import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { ChevronLeft, Trophy } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { sportsCatalog, slugify, localISODate } from "@/data/mockData";

// Sport-level pages map to the stored sport name
const SPORT_SLUGS: Record<string, string> = {
  nfl: "american football", mlb: "baseball", football: "soccer", soccer: "soccer", basketball: "basketball", tennis: "tennis",
  "ice-hockey": "ice hockey", cricket: "cricket", rugby: "rugby", baseball: "baseball",
  "american-football": "american football", efootball: "esports", esports: "esports",
  "table-tennis": "table tennis", handball: "handball", volleyball: "volleyball",
  vfootball: "vfootball", motorsport: "motorsport",
};

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
    const sport = SPORT_SLUGS[slug];
    if (sport) return matches.filter((m) => (m.sport ?? "soccer") === sport);
    if (slug === "today-s-football") return matches.filter((m) => m.sport === "soccer" && (m.rawDate === localISODate() || m.live));
    if (slug === "football-in-next-3-hours") {
      const now = new Date(); const later = new Date(now.getTime() + 3 * 3600_000);
      return matches.filter((m) => {
        if (m.sport !== "soccer" || !m.rawDate) return false;
        const t = new Date(`${m.rawDate}T${m.time}:00`);
        return t >= now && t <= later;
      });
    }
    const exact = matches.filter((m) => slugify(m.league) === slug);
    if (exact.length) return exact;
    const words = leagueName.toLowerCase().split(" ").filter((w) => w.length > 2 && !["league", "the"].includes(w));
    return matches.filter((m) => words.some((w) => m.league.toLowerCase().includes(w)));
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No matches available here right now. Check back soon.</p>
        )}
        {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </AppLayout>
  );
};

export default League;
