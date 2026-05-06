import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Share2, Trophy, Medal, Award, Grid3x3, ChevronRight, Crown } from "lucide-react";
import { sportsCatalog, slugify } from "@/data/mockData";

const topActions = [
  { label: "Load Code", icon: Share2, to: "/load-code" },
  { label: "Virtuals", icon: Grid3x3, to: "/virtuals" },
  { label: "Jackpot", icon: Trophy, to: "/jackpot" },
  { label: "Livescore", icon: Medal, to: "/livescore" },
  { label: "Results", icon: Award, to: "/results" },
];

const tabs = ["Sports", "Live (108)", "Promotions (20)"] as const;

const Menu = () => {
  const [tab, setTab] = useState(0);
  const [activeSport, setActiveSport] = useState(sportsCatalog[0].name);
  const navigate = useNavigate();
  const sport = sportsCatalog.find((s) => s.name === activeSport)!;

  return (
    <AppLayout headerVariant="search">
      {/* Search bar */}
      <div className="bg-primary px-4 pb-3">
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center justify-between bg-white rounded-lg px-4 py-3 text-muted-foreground text-sm"
        >
          <span>Teams/Players, League, Game ID</span>
          <Search className="w-5 h-5" />
        </button>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {topActions.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-1 text-primary-foreground active:scale-95 transition"
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card grid grid-cols-3 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`py-3 text-sm font-bold relative ${tab === i ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t}
            {tab === i && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid grid-cols-[140px_1fr] bg-card min-h-[60vh]">
          <nav className="border-r border-border bg-secondary/40">
            {sportsCatalog.map((s) => {
              const active = activeSport === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => setActiveSport(s.name)}
                  className={`flex w-full items-center justify-between gap-1 px-4 py-4 text-sm font-bold border-l-4 transition ${
                    active
                      ? "border-primary bg-card text-primary"
                      : "border-transparent text-foreground/80 hover:bg-card/60"
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {s.count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide bg-secondary/40">
              <Crown className="w-3.5 h-3.5 text-gold" /> {sport.name} Leagues
            </div>
            {sport.leagues.map((l) => (
              <Link
                key={l}
                to={`/league/${slugify(l)}`}
                className="flex items-center justify-between gap-2 px-4 py-4 text-sm font-medium text-foreground hover:bg-secondary/60 active:bg-secondary transition"
              >
                <span className="truncate">{l}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="bg-card p-6 text-center min-h-[40vh]">
          <p className="text-foreground font-bold mb-2">108 Live events available</p>
          <Link to="/live" className="inline-block mt-2 px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-bold">
            Open Live Center
          </Link>
        </div>
      )}

      {tab === 2 && (
        <div className="bg-card p-6 text-center min-h-[40vh]">
          <p className="text-foreground font-bold mb-2">20 active promotions</p>
          <Link to="/promotions" className="inline-block mt-2 px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-bold">
            View Promotions
          </Link>
        </div>
      )}
    </AppLayout>
  );
};

export default Menu;
