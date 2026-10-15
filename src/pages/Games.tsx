import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Grid2X2, Flame, Sparkles, Rocket, Zap, Disc3, Dices, Spade, Hash, Ticket, Gamepad2, LockKeyhole, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGate } from "@/context/AuthGateContext";
import { gameCatalog, filterCatalog, CatalogGame } from "@/data/gameCatalog";
import { GameCover } from "@/components/games/GameCover";
import casinoBanner from "@/assets/casino-banner.jpg";

const categories = [
  { name: "All Games", icon: Grid2X2 }, { name: "Popular", icon: Flame }, { name: "New", icon: Sparkles },
  { name: "Crash", icon: Rocket }, { name: "Quick", icon: Zap }, { name: "Wheel", icon: Disc3 },
  { name: "Slots", icon: Gamepad2 }, { name: "Dice", icon: Dices }, { name: "Card Games", icon: Spade },
  { name: "Numbers", icon: Hash }, { name: "Playable", icon: Gamepad2 },
];

const Games = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Games");
  const [preview, setPreview] = useState<CatalogGame | null>(null);
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const { requireAuth } = useAuthGate();
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("games").select("slug").eq("active", true).eq("maintenance", false);
    setActiveSlugs((data ?? []).map((game) => game.slug));
    setLoadError(Boolean(error));
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const catalog = gameCatalog.map((game) => ({ ...game, playable: game.playable && activeSlugs.includes(game.slug) }));
  const visible = filterCatalog(catalog, category, query);
  const launch = (game: CatalogGame) => {
    if (!game.playable) { setPreview(game); return; }
    requireAuth(() => navigate(`/games/${game.slug}`), `Log in or register to play ${game.title}.`);
  };

  return <AppLayout headerVariant="games">
    <div className="games-room">
      <div className="sportsbook-shell games-layout">
        <aside className="games-category-nav" aria-label="Game categories">
          {categories.map(({ name, icon: Icon }) => <Button key={name} variant="ghost" onClick={() => setCategory(name)} aria-pressed={category === name} className={`games-category ${category === name ? "games-category-active" : ""}`}><Icon />{name}</Button>)}
          <Button asChild variant="ghost" className="games-category"><Link to="/lottery"><Ticket />Lottery</Link></Button>
          <Button asChild variant="ghost" className="games-category"><Link to="/jackpot"><Sparkles />Jackpot</Link></Button>
        </aside>
        <div className="min-w-0">
          <section className="games-banner">
            <img src={casinoBanner} alt="Red airplane, roulette and playing cards" width={1536} height={512} className="absolute inset-0 w-full h-full object-cover" />
            <div className="games-banner-copy"><span className="text-gold text-xs font-bold uppercase">Crown Games</span><h1 className="text-3xl font-extrabold mt-2">Your next favourite game</h1><p className="text-sm mt-2">Aviator · Casino · Instant games</p><Button onClick={() => setCategory("Playable")} className="mt-5 bg-success text-success-foreground hover:bg-success/90 font-bold">Play now <ArrowRight /></Button></div>
          </section>
          <section className="games-featured" aria-label="Featured games">
            <h2 className="text-lg font-bold mb-3 text-gold">Crown favourites</h2>
            <div className="grid grid-cols-3 gap-3">{catalog.filter((game) => ["aviator", "coin-flip", "wheel"].includes(game.slug)).map((game) => <Button key={game.slug} variant="ghost" className="games-feature-item" onClick={() => launch(game)}><div className="w-14 shrink-0 rounded overflow-hidden"><GameCover slug={game.slug} title={game.title} /></div><span className="min-w-0 text-left"><span className="block font-bold whitespace-normal">{game.title}</span><span className="block text-xs text-success mt-1">{game.playable ? "Play" : "Unavailable"}</span></span></Button>)}</div>
          </section>
          <section className="games-catalog">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5"><h2 className="text-xl font-extrabold">{category} <span className="text-sm font-normal opacity-60">({visible.length})</span></h2><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 w-4 h-4 opacity-60" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for your favourite game" aria-label="Search games" className="games-search pl-9" /></div></div>
            {loadError && <div className="mb-4 text-sm flex gap-3 items-center">Playable games could not be loaded.<Button size="sm" variant="outline" onClick={load}>Retry</Button></div>}
            <div className="games-grid">{visible.map((game) => <Button variant="ghost" key={game.slug} onClick={() => launch(game)} className="game-tile" aria-label={`${game.title}${game.playable ? ", play" : ", preview"}`}><GameCover slug={game.slug} title={game.title} /><span className="game-tile-top">{game.badge && <span className="game-badge">{game.badge}</span>}<span className="game-availability">{loading ? "Loading" : game.playable ? "Play now" : "Coming soon"}</span></span><span className="game-tile-footer">{game.title}{game.playable ? <ArrowRight className="w-4 h-4" /> : <LockKeyhole className="w-3 h-3" />}</span></Button>)}</div>
            {visible.length === 0 && <p className="text-center py-12 opacity-70">No games match your search.</p>}
          </section>
        </div>
      </div>
    </div>
    <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{preview?.title}</DialogTitle><DialogDescription>{preview && gameCatalog.find((game) => game.slug === preview.slug)?.playable ? "This game is currently unavailable. No stake will be taken." : "This provider title is a preview and is not available to play yet. No stake will be taken."}</DialogDescription></DialogHeader>{preview && <div className="w-48 mx-auto rounded overflow-hidden"><GameCover slug={preview.slug} title={preview.title} /></div>}<Button onClick={() => { setPreview(null); setCategory("Playable"); }}>Browse playable games</Button></DialogContent></Dialog>
  </AppLayout>;
};
export default Games;
