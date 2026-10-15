import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useMatches } from "@/hooks/useMatches";
import { useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { sportsCatalog } from "@/data/mockData";
import { SectionBetslip } from "@/components/layout/SectionBetslip";
import footballPromo from "@/assets/football-promo.jpg";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Live = () => {
  const [sport, setSport] = useState("soccer");
  const { matches } = useMatches({ live: true });
  const { session } = useAuth();
  const { openGate } = useAuthGate();

  return (
    <AppLayout>
      <div className="reference-section-room">
      <div className="reference-section-hero"><img src={footballPromo} alt="Football players on the pitch" width={1536} height={768} /><div className="sportsbook-shell reference-section-hero-copy">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live Now
          <span className="ml-auto text-sm font-medium text-surface-dark-foreground/60">{matches.length} matches</span>
        </h1>
      </div></div></div>
      <div className="sportsbook-shell reference-section-columns">
      <nav className="reference-section-panel">{sportsCatalog.filter((item) => !["Popular", "vFootball"].includes(item.name)).map((item) => <Button key={item.name} variant="ghost" onClick={() => setSport(item.name === "Football" ? "soccer" : item.name.toLowerCase())} className={`w-full justify-start rounded-none h-11 ${sport === (item.name === "Football" ? "soccer" : item.name.toLowerCase()) ? "bg-success text-success-foreground" : ""}`}>{item.name}</Button>)}</nav>
      <div className="min-w-0">
      {!session ? (
        <div className="px-4 py-10">
          <div className="max-w-sm mx-auto reference-section-panel rounded-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold ">Live betting is for members</h2>
            <p className="text-sm text-surface-dark-foreground/60 mt-1">
              {matches.length} live matches are running right now. Create a free account to watch live odds and bet in-play.
            </p>
            <Button
              onClick={() => openGate("Register to view live matches and bet in-play.")}
              className="w-full mt-5 bg-gradient-primary text-primary-foreground font-bold h-11"
            >
              Register to view live
            </Button>
            <Link to="/" className="inline-block mt-4 text-sm text-primary font-bold">
              Browse upcoming matches →
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {matches.filter((match) => match.sport === sport).map((m) => <MatchCard key={m.id} match={m} />)}
          {matches.filter((match) => match.sport === sport).length === 0 && (
            <p className="text-center text-surface-dark-foreground/60 py-12">No live matches right now.</p>
          )}
        </div>
      )}
      </div><SectionBetslip /></div></div>
    </AppLayout>
  );
};

export default Live;
