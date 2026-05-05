import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search as SearchIcon, X } from "lucide-react";
import { featuredMatches, popularLeagues } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!q) return [];
    const t = q.toLowerCase();
    return featuredMatches.filter(
      (m) => m.home.toLowerCase().includes(t) || m.away.toLowerCase().includes(t) || m.league.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <AppLayout headerVariant="search">
      <div className="bg-primary px-4 pb-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Teams, leagues, game ID…"
            className="flex-1 py-3 outline-none text-foreground bg-transparent"
          />
          {q && (
            <button onClick={() => setQ("")}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <button onClick={() => navigate(-1)} className="text-primary font-bold text-sm">Cancel</button>
        </div>
      </div>

      <div className="px-4 py-4">
        {!q && (
          <>
            <h2 className="text-sm font-bold text-muted-foreground mb-3">POPULAR LEAGUES</h2>
            <div className="flex flex-wrap gap-2">
              {popularLeagues.map((l) => (
                <button
                  key={l}
                  onClick={() => setQ(l.split(" ")[0])}
                  className="px-3 py-2 bg-card rounded-full text-sm border border-border"
                >
                  {l}
                </button>
              ))}
            </div>
          </>
        )}

        {q && results.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No matches found for "{q}"</p>
        )}

        <div className="space-y-2 mt-4">
          {results.map((m) => (
            <div key={m.id} className="bg-card rounded-lg p-3 shadow-card">
              <div className="text-xs text-muted-foreground mb-1">{m.league}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{m.home} vs {m.away}</span>
                <span className="text-xs text-muted-foreground">{m.date} {m.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchPage;
