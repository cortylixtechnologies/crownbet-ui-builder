import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { games } from "@/data/mockData";
import { Search, Home, Megaphone, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const Games = () => {
  const [q, setQ] = useState("");
  return (
    <AppLayout headerVariant="games">
      {/* Winner banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white px-4 py-3 flex items-center gap-2 text-sm">
        <Megaphone className="w-5 h-5 text-gold" />
        <span>0***8 won <span className="text-gold font-bold">TZS 1,000.00</span> in Fruit Hunt</span>
        <button className="ml-auto bg-gold text-gold-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          Play <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
        </button>
      </div>

      <div className="bg-surface-dark text-surface-dark-foreground min-h-[80vh] pb-6">
        <div className="px-4 pt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search games"
              className="w-full bg-surface-dark-muted text-white placeholder:text-white/50 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none border border-white/10 focus:border-primary"
            />
          </div>
          <button className="flex items-center gap-1.5 bg-surface-dark-muted px-4 py-2.5 rounded-full text-sm border border-white/10">
            <Home className="w-4 h-4" /> Home <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {Object.entries(games).map(([category, list]) => (
          <section key={category} className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">{category}</h2>
              <button className="text-success text-xs font-bold bg-success/10 px-3 py-1 rounded-full">
                Show All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {list.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toast.info(`Launching ${g.title}…`)}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${g.color} shadow-card relative overflow-hidden flex flex-col items-center justify-center p-2 hover:shadow-elevated hover:-translate-y-0.5 active:scale-95 transition`}
                >
                  <div className="text-4xl drop-shadow">{g.emoji}</div>
                  <div className="mt-1 text-white font-extrabold text-xs text-center drop-shadow leading-tight">
                    {g.title}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
};

export default Games;
