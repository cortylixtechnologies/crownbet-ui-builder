import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Printer, RefreshCw, SlidersHorizontal, Flame, Star } from "lucide-react";
import { Match, slugify } from "@/data/mockData";
import { useBetslip } from "@/context/BetslipContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const popular = [
  "Today's Football",
  "Football in Next 3 Hours",
  "UEFA Champions League",
  "Europa League",
  "Premier League",
  "La Liga",
  "Serie A",
  "Club Friendlies",
];

const highlightTabs = ["Football", "vFootball", "Basketball", "Tennis", "eFootball", "More Sports"];

const OddButton = ({
  label,
  odd,
  picked,
  onClick,
}: { label: string; odd: number; picked: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between px-3 h-11 rounded-md text-sm transition ${
      picked
        ? "bg-success text-success-foreground"
        : "bg-secondary text-foreground hover:bg-success/15 hover:text-success"
    }`}
  >
    <span className="text-xs opacity-70">{label}</span>
    <span className="font-bold">{odd.toFixed(2)}</span>
  </button>
);

const MatchRow = ({ match }: { match: Match }) => {
  const { addSelection, selections } = useBetslip();
  const { requireAuth } = useAuthGate();
  const isPicked = (k: string) => selections.some((s) => s.id === `${match.id}-${k}`);

  const pick = (k: "home" | "draw" | "away", label: string, odd: number) =>
    requireAuth(() => {
      addSelection({
        id: `${match.id}-${k}`,
        matchId: match.id,
        match: `${match.home} vs ${match.away}`,
        market: "1X2",
        pick: label,
        odd,
      });
      toast.success("Added to betslip", { description: `${match.home} vs ${match.away} — ${label}` });
    }, "Sign up or log in to add this selection to your betslip.");

  return (
    <div className="grid grid-cols-[92px_1fr_320px] items-center gap-4 px-4 py-3 border-b border-border hover:bg-secondary/60 transition-colors">
      <div className="text-xs text-muted-foreground leading-tight">
        {match.live ? (
          <span className="inline-flex items-center gap-1 text-success font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {match.minute}
          </span>
        ) : (
          <>
            <div className="font-bold text-foreground">{match.time}</div>
            <div>{match.date}</div>
          </>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Star className="w-3.5 h-3.5" />
          <span className="truncate">{match.league}</span>
          {match.hot && (
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-1.5 rounded text-[10px] font-bold">
              HOT <Flame className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="mt-1 text-sm font-bold text-foreground truncate">
          {match.home} <span className="text-muted-foreground font-normal">vs</span> {match.away}
          {match.live && match.score && <span className="ml-2 text-success">{match.score}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <OddButton label="1" odd={match.odds.home} picked={isPicked("home")} onClick={() => pick("home", "1", match.odds.home)} />
        <OddButton label="X" odd={match.odds.draw} picked={isPicked("draw")} onClick={() => pick("draw", "X", match.odds.draw)} />
        <OddButton label="2" odd={match.odds.away} picked={isPicked("away")} onClick={() => pick("away", "2", match.odds.away)} />
      </div>
    </div>
  );
};

export const DesktopHome = ({
  matches,
  promos,
}: {
  matches: Match[];
  promos: { id: string; title: string; color: string; emoji: string; to_url: string }[];
}) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { selections, totalOdds, clear } = useBetslip();
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("Football");
  const [email, setEmail] = useState("");

  const banners = promos.length ? promos : [];
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const live = matches.filter((m) => m.live);

  return (
    <div className="hidden lg:block bg-secondary pb-12">
      {/* Hero band */}
      <div className="bg-surface-dark">
        <div className="mx-auto max-w-[1280px] px-6 py-6 grid grid-cols-[260px_1fr_300px] gap-5">
          {/* Popular */}
          <aside>
            <h2 className="text-xl font-extrabold text-surface-dark-foreground mb-2">Popular</h2>
            <ul>
              {popular.map((p) => (
                <li key={p}>
                  <Link
                    to={`/league/${slugify(p)}`}
                    className="flex items-center justify-between py-2.5 text-sm font-semibold text-surface-dark-foreground/85 border-b border-surface-dark-muted hover:text-primary transition-colors"
                  >
                    {p}
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Carousel */}
          <div className="relative rounded-lg overflow-hidden shadow-elevated min-h-[320px]">
            {banners.map((b, i) => (
              <Link
                key={b.id}
                to={b.to_url}
                className={`absolute inset-0 bg-gradient-to-br ${b.color} flex flex-col items-center justify-center text-center px-10 transition-opacity duration-700 ${
                  i === slide ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="text-7xl drop-shadow">{b.emoji}</div>
                <h3 className="mt-4 text-4xl font-extrabold text-primary-foreground drop-shadow max-w-xl leading-tight">
                  {b.title}
                </h3>
                <span className="mt-6 inline-block bg-card text-foreground font-extrabold px-8 py-2.5 rounded-full">
                  BET NOW
                </span>
              </Link>
            ))}
            {banners.length === 0 && (
              <div className="absolute inset-0 bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-extrabold">
                Welcome to CrownBet
              </div>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${i === slide ? "bg-card" : "bg-card/40"}`}
                />
              ))}
            </div>
          </div>

          {/* Register / betslip teaser */}
          <div>
            {session ? (
              <div className="bg-card rounded-lg p-4 shadow-card">
                <h3 className="font-extrabold text-foreground">Betslip ({selections.length})</h3>
                {selections.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on any odds to add a selection to your betslip.
                  </p>
                ) : (
                  <>
                    <ul className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                      {selections.map((s) => (
                        <li key={s.id} className="text-xs border-b border-border pb-2">
                          <div className="font-bold text-foreground truncate">{s.match}</div>
                          <div className="text-muted-foreground">
                            {s.pick} @ <span className="font-bold text-success">{s.odd.toFixed(2)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-sm mt-3">
                      <span className="text-muted-foreground">Total odds</span>
                      <span className="font-bold">{totalOdds.toFixed(2)}</span>
                    </div>
                    <Button onClick={() => navigate("/betslip")} className="w-full mt-3 bg-gradient-primary text-primary-foreground font-bold h-11">
                      Go to betslip
                    </Button>
                    <button onClick={clear} className="w-full mt-2 text-xs text-muted-foreground hover:text-destructive">
                      Clear selections
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-surface-dark-foreground">
                <h3 className="text-2xl font-extrabold mb-3">Instant Registration</h3>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-12 bg-card text-foreground border-0"
                />
                <Button
                  onClick={() => navigate("/register", { state: { email } })}
                  className="w-full mt-3 h-12 bg-success text-success-foreground hover:bg-success/90 font-extrabold text-base"
                >
                  Register
                </Button>
                <p className="text-xs text-surface-dark-foreground/60 mt-3">
                  18+ only. Bet responsibly. New players get a welcome bonus on first deposit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Virtual strip */}
      <div className="mx-auto max-w-[1280px] px-6 -mt-1 pt-5">
        <Link
          to="/virtuals"
          className="flex items-center justify-between bg-gradient-dark rounded-lg px-8 py-5 shadow-card hover:shadow-elevated transition"
        >
          <div className="text-surface-dark-foreground">
            <div className="text-2xl font-extrabold">
              Crown<span className="text-primary">Bet</span> VIRTUAL WORLD
            </div>
            <div className="text-sm opacity-75">Bet on every second — football, racing, keno & more</div>
          </div>
          <span className="bg-primary text-primary-foreground font-extrabold px-6 py-2 rounded-full">BET NOW</span>
        </Link>
      </div>

      {/* Highlights + betslip column */}
      <div className="mx-auto max-w-[1280px] px-6 pt-5 grid grid-cols-[1fr_320px] gap-5">
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground">
              <span className="w-3.5 h-3.5 rounded-full bg-success" /> Highlights
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print
              </button>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <Link to="/menu" className="flex items-center gap-1 hover:text-foreground transition-colors">
                Filter <SlidersHorizontal className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6 px-4 border-b border-border">
            {highlightTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-2.5 text-sm font-bold border-b-2 transition-colors ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
            {["UEFA Champions League", "Europa League", "Premier League", "La Liga", "Serie A"].map((l, i) => (
              <Link
                key={l}
                to={`/league/${slugify(l)}`}
                className={`shrink-0 min-w-[150px] rounded-md border px-3 py-2.5 text-sm transition ${
                  i === 0 ? "border-success bg-success/5" : "border-border hover:border-success"
                }`}
              >
                <div className="text-xs text-muted-foreground">Europe</div>
                <div className="font-bold text-foreground truncate">{l}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[92px_1fr_320px] gap-4 px-4 py-2 bg-secondary text-[11px] font-bold text-muted-foreground uppercase">
            <span>Time</span>
            <span>Match</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <span>1</span><span>X</span><span>2</span>
            </div>
          </div>

          {matches.map((m) => <MatchRow key={m.id} match={m} />)}
          {matches.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">No fixtures published yet.</p>
          )}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="bg-surface-dark text-surface-dark-foreground rounded-lg overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-surface-dark-muted">
              <h3 className="font-extrabold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Now
              </h3>
              <Link to="/live" className="text-xs font-bold text-primary hover:underline">See all</Link>
            </div>
            <div className="divide-y divide-surface-dark-muted">
              {live.slice(0, 6).map((m) => (
                <Link key={m.id} to="/live" className="block px-4 py-3 hover:bg-surface-dark-muted transition-colors">
                  <div className="text-[11px] text-surface-dark-foreground/60 truncate">{m.league} · {m.minute}</div>
                  <div className="text-sm font-semibold flex justify-between gap-2">
                    <span className="truncate">{m.home} v {m.away}</span>
                    <span className="text-success font-bold">{m.score}</span>
                  </div>
                </Link>
              ))}
              {live.length === 0 && (
                <p className="px-4 py-6 text-sm text-surface-dark-foreground/60 text-center">No live matches right now.</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card p-4">
            <h3 className="font-extrabold text-foreground">Quick links</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { l: "Aviator", to: "/games/aviator" },
                { l: "Jackpot", to: "/jackpot" },
                { l: "Lottery", to: "/lottery" },
                { l: "Casino", to: "/games" },
                { l: "Load Code", to: "/load-code" },
                { l: "Results", to: "/results" },
              ].map((q) => (
                <Link
                  key={q.l}
                  to={q.to}
                  className="text-sm font-bold text-center py-2.5 rounded-md bg-secondary hover:bg-success/15 hover:text-success transition"
                >
                  {q.l}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
