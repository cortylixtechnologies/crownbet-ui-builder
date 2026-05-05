import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Share2, Trophy, Medal, Award, Grid3x3 } from "lucide-react";
import { sportsList, popularLeagues } from "@/data/mockData";

const topActions = [
  { label: "Load Code", icon: Share2 },
  { label: "Virtuals", icon: Grid3x3 },
  { label: "Jackpot", icon: Trophy },
  { label: "Livescore", icon: Medal },
  { label: "Results", icon: Award },
];

const tabs = ["Sports", "Live (108)", "Promotions (20)"];

const Menu = () => {
  const [tab, setTab] = useState(0);
  const [activeSport, setActiveSport] = useState("Popular");
  const navigate = useNavigate();

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
          {topActions.map(({ label, icon: Icon }) => (
            <button key={label} className="flex flex-col items-center gap-1 text-primary-foreground">
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
            </button>
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
            {tab === i && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-success rounded-full" />}
          </button>
        ))}
      </div>

      {/* Two-pane sports/leagues */}
      <div className="grid grid-cols-[140px_1fr] bg-card min-h-[60vh]">
        <div className="border-r border-border">
          {sportsList.map((s) => (
            <button
              key={s.name}
              onClick={() => setActiveSport(s.name)}
              className={`block w-full text-left px-4 py-4 text-base font-bold ${
                activeSport === s.name ? "text-success bg-secondary" : "text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="divide-y divide-border">
          {popularLeagues.map((l) => (
            <button key={l} className="block w-full text-left px-4 py-4 text-sm font-medium text-foreground">
              {l}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Menu;
