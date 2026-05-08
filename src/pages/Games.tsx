import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Home, Megaphone, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DbGame = { id: string; slug: string; title: string; color: string; emoji: string; category: string };

const Games = () => {
  const [q, setQ] = useState("");
  const [games, setGames] = useState<DbGame[]>([]);

  useEffect(() => {
    supabase.from("games").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => setGames((data ?? []) as DbGame[]));
  }, []);

  const grouped = games.reduce<Record<string, DbGame[]>>((acc, g) => {
    (acc[g.category] ||= []).push(g);
    return acc;
  }, {});

  const filter = (list: DbGame[]) =>
    !q ? list : list.filter((g) => g.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout headerVariant="games">
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white px-4 py-3 flex items-center gap-2 text-sm">
        <Megaphone className="w-5 h-5 text-gold" />
        <span>0***8 won <span className="text-gold font-bold">TZS 1,000.00</span> in Aviator</span>
        <button className="ml-auto bg-gold text-gold-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          Play <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
        </button>
      </div>

      <div className="bg-surface-dark text-surface-dark-foreground min-h-[80vh] pb-6">
        <div className="px-4 pt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search games"
              className="w-full bg-surface-dark-muted text-white placeholder:text-white/50 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none border border-white/10 focus:border-primary" />
          </div>
          <button className="flex items-center gap-1.5 bg-surface-dark-muted px-4 py-2.5 rounded-full text-sm border border-white/10">
            <Home className="w-4 h-4" /> Home <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {Object.entries(grouped).map(([category, list]) => {
          const visible = filter(list);
          if (!visible.length) return null;
          return (
            <section key={category} className="mt-6 px-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">{category}</h2>
                <button className="text-success text-xs font-bold bg-success/10 px-3 py-1 rounded-full">
                  Show All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {visible.map((g) => (
                  <Link key={g.id} to={`/games/${g.slug}`}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${g.color} shadow-card relative overflow-hidden flex flex-col items-center justify-center p-2 hover:shadow-elevated hover:-translate-y-0.5 active:scale-95 transition`}>
                    <div className="text-4xl drop-shadow">{g.emoji}</div>
                    <div className="mt-1 text-white font-extrabold text-xs text-center drop-shadow leading-tight">
                      {g.title}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {games.length === 0 && (
          <p className="text-center text-white/60 py-12">No games available.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default Games;
