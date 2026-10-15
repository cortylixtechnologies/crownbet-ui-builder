import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Printer, RefreshCw, SlidersHorizontal, Flame, Star, Trophy, Ticket, Dices, Plane, ClipboardList, Trash2 } from "lucide-react";
import { Match, slugify } from "@/data/mockData";
import { useBetslip } from "@/context/BetslipContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/context/AuthGateContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import footballPromo from "@/assets/football-promo.jpg";

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
  <Button variant="secondary"
    onClick={onClick}
    className={`flex items-center justify-between px-2 h-9 rounded-sm text-sm transition ${
      picked
        ? "bg-success text-success-foreground"
        : "bg-secondary text-foreground hover:bg-success/15 hover:text-success"
    }`}
  >
    <span className="text-xs opacity-70">{label}</span>
    <span className="font-bold">{odd.toFixed(2)}</span>
  </Button>
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
    <div className="grid grid-cols-[58px_minmax(0,1fr)_230px] items-center gap-2 px-3 py-3 border-b border-border hover:bg-secondary/60 transition-colors">
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
      <div className="grid grid-cols-3 gap-1">
        <OddButton label="1" odd={match.odds.home} picked={isPicked("home")} onClick={() => pick("home", "1", match.odds.home)} />
        <OddButton label="X" odd={match.odds.draw} picked={isPicked("draw")} onClick={() => pick("draw", "X", match.odds.draw)} />
        <OddButton label="2" odd={match.odds.away} picked={isPicked("away")} onClick={() => pick("away", "2", match.odds.away)} />
      </div>
    </div>
  );
};

export const DesktopHome = ({ matches, promos }: { matches: Match[]; promos: { id: string; title: string; color: string; emoji: string; to_url: string }[] }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { requireAuth } = useAuthGate();
  const { selections, totalOdds, clear } = useBetslip();
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("Football");
  const [email, setEmail] = useState("");
  const [market, setMarket] = useState("1X2");
  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % promos.length), 6000);
    return () => clearInterval(timer);
  }, [promos.length]);
  const currentPromo = promos[slide % Math.max(promos.length, 1)];
  const sportByTab: Record<string, string> = { Football: "soccer", vFootball: "vfootball", Basketball: "basketball", Tennis: "tennis", eFootball: "esports" };
  const filtered = matches.filter(m => (m.sport ?? "soccer") === sportByTab[tab]);
  return (
    <div className="hidden lg:block bg-secondary pb-8">
      <div className="bg-surface-dark border-b border-surface-dark-muted">
        <div className="sportsbook-shell grid grid-cols-[220px_minmax(0,1fr)_220px] gap-5 py-2">
          <aside className="text-surface-dark-foreground">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><Flame className="h-4 w-4 text-primary" />Popular</h2>
            {popular.slice(0, 7).map(p => <Link key={p} to={`/league/${slugify(p)}`} className="flex items-center justify-between text-xs py-2.5 border-b border-surface-dark-muted hover:text-success transition-colors">{p}<ChevronRight className="w-3 h-3 shrink-0" /></Link>)}
          </aside>
          <section className="relative overflow-hidden min-h-[270px] text-surface-dark-foreground">
            <img src={footballPromo} width={1536} height={768} alt="Football players competing for the ball" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-promo-shade" />
            <div className="relative px-6 py-7 max-w-[65%]">
              <span className="text-xs font-bold uppercase text-gold">CrownBet · Match day</span>
              <h1 className="text-3xl font-extrabold leading-tight mt-3">{currentPromo?.title || "CrownBet Football"}</h1>
              <Button className="mt-5 bg-success text-success-foreground hover:bg-success/90 rounded-sm font-bold px-7" onClick={() => requireAuth(() => navigate(currentPromo?.to_url || "/live"), "Sign up or log in to bet on this promotion.")}>BET NOW<ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="absolute bottom-3 left-6 flex gap-1.5">{promos.map((p, i) => <Button key={p.id} variant="ghost" size="icon" aria-label={`Promotion ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 w-6 rounded-none hover:bg-success ${slide === i ? "bg-success" : "bg-surface-dark-foreground/40"}`} />)}</div>
          </section>
          <aside className="text-surface-dark-foreground py-3">
            <h2 className="text-xl font-bold mb-4">{session ? "Your CrownBet" : "Instant Registration"}</h2>
            {session ? <Button className="w-full bg-success text-success-foreground hover:bg-success/90 rounded-sm" onClick={() => navigate("/me")}>My account</Button> : <><Input aria-label="Registration email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" className="bg-card text-foreground h-11 rounded-sm border-0" /><Button onClick={() => navigate("/register", { state: { email } })} className="w-full mt-3 h-11 bg-success text-success-foreground hover:bg-success/90 rounded-sm font-bold">Register</Button><p className="text-xs text-surface-dark-foreground/60 mt-3 leading-relaxed">18+ only. Terms and conditions apply. Please play responsibly.</p><Link to="/login" className="inline-block mt-3 text-xs hover:text-success">Already a member? Log in</Link></>}
          </aside>
        </div>
      </div>
      <div className="sportsbook-shell grid grid-cols-[minmax(0,1fr)_260px] gap-4 pt-3 items-start">
        <div className="min-w-0">
          <div className="bg-surface-dark text-surface-dark-foreground flex justify-between items-center px-4 py-3 mb-3">
            <Link to="/games" className="flex items-center gap-3 hover:text-success"><Plane className="h-7 w-7 text-success" /><span className="font-extrabold text-lg">CROWN GAMES<span className="block text-xs font-normal text-surface-dark-foreground/65">Aviator · Mines · Dice · Coin Flip</span></span></Link>
            <Button size="sm" className="rounded-sm bg-success text-success-foreground hover:bg-success/90" onClick={() => requireAuth(() => navigate("/games"), "Sign up or log in to play instant games.")}>PLAY NOW</Button>
          </div>
          <section className="bg-card border border-border">
            <div className="flex justify-between items-center px-3 pt-3"><h2 className="text-xl font-bold text-foreground"><span className="inline-block w-4 h-4 mr-2 rounded-full bg-success" />Highlights</h2><div className="flex gap-1"><Button variant="ghost" size="icon" title="Print fixtures" aria-label="Print fixtures" onClick={() => window.print()} className="w-8 h-8"><Printer className="w-4 h-4" /></Button><Button variant="ghost" size="icon" title="Refresh fixtures" aria-label="Refresh fixtures" onClick={() => window.location.reload()} className="w-8 h-8"><RefreshCw className="w-4 h-4" /></Button><Button variant="ghost" size="icon" title="Filter sports" aria-label="Filter sports" onClick={() => navigate("/menu")} className="w-8 h-8"><SlidersHorizontal className="w-4 h-4" /></Button></div></div>
            <div className="flex overflow-x-auto scrollbar-hide px-3 border-b border-border gap-4">{highlightTabs.map(t => <Button key={t} variant="ghost" onClick={() => t === "vFootball" ? navigate("/league/vfootball") : t === "More Sports" ? navigate("/menu") : setTab(t)} className={`rounded-none px-0 text-xs h-11 border-b-2 hover:bg-transparent hover:text-success ${tab === t ? "border-success text-success" : "border-transparent text-muted-foreground"}`}>{t}</Button>)}</div>
            <div className="flex gap-2 px-3 py-3 overflow-auto scrollbar-hide">{["Today's Football", "Premier League", "Champions League"].map(l => <Link key={l} to={`/league/${slugify(l)}`} className="shrink-0 text-xs px-2 py-2 border border-border hover:border-success hover:text-success">{l}</Link>)}</div>
            <div className="grid grid-cols-[58px_minmax(0,1fr)_230px] gap-2 px-3 py-2 bg-secondary text-xs text-muted-foreground"><span>Time</span><span>Teams</span><div className="text-center">1X2</div></div>
            {filtered.map(m => <MatchRow key={m.id} match={m} />)}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No fixtures published for {tab.toLowerCase()}.</p>}
          </section>
          <section className="bg-surface-dark text-surface-dark-foreground mt-3">
            <div className="flex justify-between items-center px-3 py-3"><h2 className="font-bold text-xl">Live Betting</h2><Button variant="link" size="sm" className="text-success" onClick={() => requireAuth(() => navigate("/live"), "Sign up or log in to view live matches.")}>See all<ChevronRight className="w-3 h-3" /></Button></div>
            <div className="flex gap-4 px-3 border-b border-surface-dark-muted">{["1X2", "Over/Under", "Double Chance"].map(m => <Button key={m} variant="ghost" onClick={() => {setMarket(m); requireAuth(() => navigate("/live"), "Sign up or log in to view live matches.");}} className={`px-0 rounded-none hover:bg-transparent hover:text-success text-xs ${market === m ? "text-success border-b-2 border-success" : "text-surface-dark-foreground/60"}`}>{m}</Button>)}</div>
            {matches.filter(m => m.live).slice(0, 3).map(m => <Button key={m.id} variant="ghost" className="w-full h-auto px-3 py-3 justify-between rounded-none text-surface-dark-foreground hover:bg-surface-dark-muted hover:text-surface-dark-foreground" onClick={() => requireAuth(() => navigate("/live"), "Sign up or log in to view live matches.")}><span className="text-xs truncate">{m.home} vs {m.away}</span><span className="text-success">{m.score}</span></Button>)}
            {!matches.some(m => m.live) && <p className="text-xs text-surface-dark-foreground/60 px-3 py-6">No live matches right now.</p>}
          </section>
          <div className="grid grid-cols-3 gap-2 mt-3">{[{title:"Casino",to:"/games",play:"/games/roulette",icon:Dices,action:"Play roulette"},{title:"Lottery",to:"/lottery",play:"/lottery",icon:Ticket,action:"Get a ticket"},{title:"Jackpot",to:"/jackpot",play:"/jackpot",icon:Trophy,action:"Enter jackpot"}].map(q => <div key={q.title} className="bg-card border border-border p-3 rounded-sm"><Link to={q.to} className="flex items-center gap-2 font-bold text-sm hover:text-success"><q.icon className="w-4 h-4 text-success" />{q.title}</Link><Button variant="link" className="px-0 text-xs mt-1 text-muted-foreground hover:text-success" onClick={() => requireAuth(() => navigate(q.play), `Sign up or log in to play ${q.title}.`)}>{q.action}<ChevronRight className="w-3 h-3" /></Button></div>)}</div>
        </div>
        <aside className="space-y-3">
          <section className="bg-card border border-border">
            <div className="bg-success text-success-foreground px-3 py-3 flex justify-between font-bold"><span>Betslip</span><span>{selections.length}</span></div>
            <div className="flex border-b border-border text-xs"><Link to="/betslip" className="flex-1 text-center py-3 border-b-2 border-success font-bold hover:text-success">Betslip</Link><Link to="/load-code" className="flex-1 text-center py-3 text-muted-foreground hover:text-success">Load Booking Code</Link></div>
            {selections.length === 0 ? <div className="px-4 py-10 text-center"><ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm font-bold">Your betslip is empty</p><p className="text-xs mt-2 text-muted-foreground">No selections added.</p></div> : <div className="p-3">{selections.map(s => <div key={s.id} className="border-b border-border py-3 text-xs"><div className="font-bold">{s.match}</div><div className="mt-1 text-muted-foreground">{s.pick}<span className="float-right text-success font-bold">{s.odd.toFixed(2)}</span></div></div>)}<div className="flex justify-between my-3 text-sm"><span>Total odds</span><strong>{totalOdds.toFixed(2)}</strong></div><Button className="w-full rounded-sm bg-success text-success-foreground hover:bg-success/90" onClick={() => navigate("/betslip")}>Go to betslip</Button><Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-1" onClick={clear}><Trash2 className="w-3 h-3" />Clear selections</Button></div>}
          </section>
          <Link to="/promotions" className="block border border-border bg-card p-4 hover:border-success"><span className="text-success text-xs font-bold">CROWNBET</span><span className="block font-extrabold text-xl mt-2">More ways to win.</span><span className="flex items-center text-xs text-muted-foreground mt-3">View promotions<ChevronRight className="h-3 w-3 ml-auto" /></span></Link>
          <div className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3"><span className="font-bold text-foreground">18+ · Play responsibly</span><p className="mt-1">Gambling can be addictive.</p></div>
        </aside>
      </div>
    </div>
  );
};
