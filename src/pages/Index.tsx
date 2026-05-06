import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { promoCards, featuredMatches, liveMatches, slugify } from "@/data/mockData";
import { Globe, Tv, Share2, Plane, Trophy, MoreHorizontal } from "lucide-react";

const quickLinks = [
  { label: "All Sports", icon: Globe, to: "/menu" },
  { label: "Live", icon: Tv, to: "/live" },
  { label: "Load Code", icon: Share2, to: "/load-code" },
  { label: "Aviator", icon: Plane, to: "/games", accent: true },
  { label: "Virtuals", icon: Trophy, to: "/games" },
  { label: "More", icon: MoreHorizontal, to: "/menu" },
];

const tabs: { label: string; to: string }[] = [
  { label: "Featured", to: "/" },
  { label: "Matches", to: "/menu" },
  { label: "Games", to: "/games" },
  { label: "Codes", to: "/load-code" },
  { label: "Virtuals", to: "/virtuals" },
];
const leagueChips = ["Today's Football", "Football In Next 3 Hours", "Champions League", "Europa League", "Premier League"];

const Index = () => {
  const [tab, setTab] = useState("Featured");
  const [leagueIdx, setLeagueIdx] = useState(0);

  return (
    <AppLayout>
      {/* Promo carousel */}
      <section className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {promoCards.map((p) => (
            <Link
              key={p.id}
              to={p.to}
              className={`relative shrink-0 w-32 h-24 rounded-xl bg-gradient-to-br ${p.color} shadow-card overflow-hidden flex items-end p-2 hover:shadow-elevated hover:-translate-y-0.5 active:scale-95 transition`}
            >
              <div className="absolute top-1 right-2 text-3xl">{p.emoji}</div>
              <span className="text-white text-xs font-bold leading-tight drop-shadow">{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="bg-card px-2 py-3 grid grid-cols-6 gap-1">
        {quickLinks.map(({ label, icon: Icon, to, accent }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-1 text-foreground">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent ? "text-primary" : "text-foreground"}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
          </Link>
        ))}
      </section>

      {/* League chips */}
      <section className="px-3 py-2 overflow-x-auto scrollbar-hide bg-card border-t border-border">
        <div className="flex gap-2">
          {leagueChips.map((c, i) => (
            <Link
              key={c}
              to={`/league/${slugify(c)}`}
              onClick={() => setLeagueIdx(i)}
              className={`shrink-0 px-3 py-2 rounded text-xs font-bold border-t-2 ${
                leagueIdx === i ? "border-primary bg-secondary text-foreground" : "border-transparent bg-secondary/50 text-muted-foreground"
              }`}
            >
              {c.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-card px-4 pt-4 pb-2 flex items-center gap-4 border-t border-border overflow-x-auto scrollbar-hide">
        {tabs.map((t) => {
          const active = tab === t.label;
          return (
            <Link
              key={t.label}
              to={t.to}
              onClick={() => setTab(t.label)}
              className={`pb-2 text-base font-bold whitespace-nowrap relative transition-colors hover:text-success ${
                active ? "text-success" : "text-muted-foreground"
              }`}
            >
              {t.label}
              {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-success rounded-full" />}
            </Link>
          );
        })}
      </section>

      {/* Match list */}
      <section className="px-3 py-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["UEFA Champions League", "Europa League", "Conference League", "CONMEBOL LIB / SUD"].map((l, i) => (
            <Link
              key={l}
              to={`/league/${slugify(l)}`}
              className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold border transition-colors hover:border-primary hover:text-primary active:scale-95 ${
                i === 0 ? "border-foreground bg-card text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {l}
            </Link>
          ))}
        </div>

        {featuredMatches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </section>

      {/* Live strip */}
      <section className="bg-surface-dark text-surface-dark-foreground mt-2 pt-4 pb-6">
        <div className="px-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <Link to="/live" className="text-xl font-bold hover:text-success transition-colors">Live</Link>
          <span className="text-white/40">|</span>
          {["Football", "vFootball", "Basketball", "Tennis", "eFootball"].map((s, i) => (
            <Link
              key={s}
              to={s === "vFootball" ? "/virtuals" : "/live"}
              className={`text-base font-bold whitespace-nowrap transition-colors hover:text-success ${
                i === 0 ? "text-success" : "text-white/80"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="px-4 mt-3 flex items-center gap-4 overflow-x-auto scrollbar-hide border-b border-white/10 pb-2">
          {["1X2", "Over/Under", "DC", "1st Half O/U"].map((m, i) => (
            <button
              key={m}
              type="button"
              className={`text-sm font-bold whitespace-nowrap pb-2 transition-colors hover:text-success ${
                i === 0 ? "text-success border-b-2 border-success" : "text-white/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="px-3 mt-3 space-y-2">
          {liveMatches.map((m) => (
            <Link
              key={m.id}
              to="/live"
              className="block bg-surface-dark-muted rounded-lg overflow-hidden hover:bg-white/10 active:scale-[0.99] transition"
            >
              <div className="flex items-center justify-between px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {m.hot && <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">HOT 🔥</span>}
                  <span className="text-success font-bold">{m.minute}</span>
                  <span className="truncate text-white/70">{m.league}</span>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center px-3 py-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{m.home}</div>
                  <div className="text-sm font-medium">{m.away}</div>
                </div>
                <div className="text-right text-success font-bold text-sm">
                  <div>{m.score?.split(" - ")[0]}</div>
                  <div>{m.score?.split(" - ")[1]}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1">
                {[m.odds.home, m.odds.draw, m.odds.away].map((o, i) => (
                  <div key={i} className="bg-white/5 text-success text-center py-2 rounded font-bold text-sm hover:bg-white/15 transition-colors">
                    {o.toFixed(2)}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
