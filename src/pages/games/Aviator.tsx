import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Minus, Plus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AviatorFlightStage } from "@/components/games/AviatorFlightStage";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

type Phase = "waiting" | "running" | "crashed";
type LiveBet = { user: string; amount: number; cashedAt: number | null; win: number | null };
type ChatMsg = { id: number; user: string; text: string; color: string };

const NAMES = ["a***1", "j***k", "m***z", "p***o", "x***9", "c***t", "r***5", "n***q", "k***l", "0***8", "f***r"];
const COLORS = ["aviator-history-rare", "aviator-positive", "aviator-history-low", "text-gold", "aviator-history-high", "aviator-history-low"];
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const Aviator = () => {
  const { aviatorStart, aviatorCashout, aviatorResolveCrashed, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(30);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [history, setHistory] = useState<number[]>([1.32, 2.45, 1.08, 5.67, 1.91, 3.21, 1.14, 1.41, 2.82]);
  const [hasBet, setHasBet] = useState(false);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [tab, setTab] = useState<"all" | "previous" | "top">("all");
  const [chat, setChat] = useState<ChatMsg[]>([
    { id: 1, user: "j***k", text: "lets fly 🚀", color: "aviator-positive" },
    { id: 2, user: "m***z", text: "cashed 5x 🔥", color: "text-gold" },
  ]);
  const [chatInput, setChatInput] = useState("");
  // Visual-only crash point. Server still owns the authoritative one.
  const visualCrashRef = useRef(0);
  const rafRef = useRef<number>();
  const startRef = useRef(0);
  const roundIdRef = useRef<string | null>(null);
  roundIdRef.current = roundId;
  const cashedRef = useRef<number | null>(null);
  cashedRef.current = cashedAt;

  const seedLiveBets = () => {
    const n = 80 + Math.floor(Math.random() * 200);
    const arr: LiveBet[] = Array.from({ length: n }, () => ({
      user: rand(NAMES),
      amount: +([10, 30, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 7)]),
      cashedAt: null,
      win: null,
    }));
    setLiveBets(arr);
  };

  const placeBet = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (phase !== "waiting") return toast.error("Wait for next round");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    const res = await aviatorStart(bet);
    if (!res) return;
    setRoundId(res.round_id);
    setHasBet(true);
    setCashedAt(null);
    toast.success(`Bet placed: $${bet}`);
  };

  const cashout = async () => {
    if (phase !== "running" || !hasBet || cashedAt !== null || !roundId) return;
    const res = await aviatorCashout(roundId, multiplier);
    if (!res) return;
    if (res.crashed) {
      toast.error(`Crashed at ${res.crash_multiplier}x`);
      setCashedAt(null);
    } else {
      setCashedAt(Number(res.multiplier));
      toast.success(`Cashed out ${Number(res.multiplier).toFixed(2)}x → +$${res.payout}`);
    }
  };

  // Visual round loop. Server is source of truth for payouts.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const startWaiting = () => {
      setPhase("waiting");
      setMultiplier(1);
      setCountdown(5);
      seedLiveBets();
      let c = 5;
      const interval = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
          startRunning();
        }
      }, 1000);
      timer = interval as any;
    };

    const startRunning = () => {
      const r = Math.random();
      visualCrashRef.current = Math.max(1.01, +(1 / (1 - r * 0.97)).toFixed(2));
      startRef.current = performance.now();
      setPhase("running");
      const tick = (t: number) => {
        const elapsed = (t - startRef.current) / 1000;
        const m = +Math.exp(elapsed * 0.35).toFixed(2);
        setLiveBets((prev) =>
          prev.map((b) => {
            if (b.cashedAt === null && Math.random() < 0.008 && m < visualCrashRef.current) {
              return { ...b, cashedAt: m, win: +(b.amount * m).toFixed(2) };
            }
            return b;
          })
        );
        if (m >= visualCrashRef.current) {
          setMultiplier(visualCrashRef.current);
          setHistory((h) => [visualCrashRef.current, ...h].slice(0, 12));
          setPhase("crashed");
          // If user had a bet and didn't cash out, finalize on server.
          if (roundIdRef.current && cashedRef.current === null) {
            aviatorResolveCrashed(roundIdRef.current);
          }
          timer = setTimeout(() => {
            setHasBet(false);
            setCashedAt(null);
            setRoundId(null);
            startWaiting();
          }, 2500);
          return;
        }
        setMultiplier(m);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    startWaiting();
    return () => {
      clearTimeout(timer);
      clearInterval(timer as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "crashed" && hasBet && cashedAt === null) {
      toast.error(`Crashed at ${visualCrashRef.current.toFixed(2)}x`);
    }
  }, [phase, hasBet, cashedAt]);

  useEffect(() => {
    const i = setInterval(() => {
      const lines = ["nice 🔥", "cash early!", "next one big", "🚀🚀🚀", "ouch", "got 3x", "auto 1.5x", "lets gooo", "💰", "rip"];
      setChat((c) => [...c.slice(-30), { id: Date.now(), user: rand(NAMES), text: rand(lines), color: rand(COLORS) }]);
    }, 4500);
    return () => clearInterval(i);
  }, []);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat((c) => [...c, { id: Date.now(), user: "you", text: chatInput, color: "text-gold" }]);
    setChatInput("");
  };

  const totalWin = liveBets.reduce((s, b) => s + (b.win ?? 0), 0);
  const visibleBets =
    tab === "previous" ? liveBets.filter((b) => b.cashedAt !== null) :
    tab === "top" ? [...liveBets].sort((a, b) => (b.win ?? 0) - (a.win ?? 0)).slice(0, 30) :
    liveBets;

  return (
    <AppLayout hideHeader>
      <div className="aviator-room">
        <div className="aviator-topbar flex items-center justify-between px-4 py-2">
          <Button asChild variant="ghost" size="icon" className="hover:bg-surface-dark-muted" aria-label="Close Aviator"><Link to="/virtuals"><X className="h-5 w-5" /></Link></Button>
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/me">Deposit</Link></Button>
        </div>
        <div className="aviator-brandbar aviator-topbar flex items-center justify-between px-3 py-1">
          <h1 className="aviator-brand">Aviator</h1>
          <div className="aviator-balance text-sm font-bold">${balance.toFixed(2)}</div>
        </div>
        <div className="aviator-layout">
          <aside className="aviator-sidebar" aria-label="Round bets">
            <div className="aviator-tabs">
              {(["all", "previous", "top"] as const).map((t) => (
                <Button key={t} variant="ghost" onClick={() => setTab(t)} className={`aviator-tab ${tab === t ? "aviator-tab-active" : ""}`} aria-pressed={tab === t}>
                  {t === "all" ? "All Bets" : t === "previous" ? "Previous" : "Top"}
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center px-2 py-3">
              <div><div className="flex -space-x-1 mb-1">{["⚽", "✈", "🎲"].map((v) => <span key={v} className="aviator-avatar">{v}</span>)}</div><div className="text-xs">{liveBets.length} <span className="aviator-muted">Bets</span></div></div>
              <div className="text-right"><div className="font-bold">{totalWin.toFixed(2)}</div><div className="aviator-muted text-[10px]">Total win</div></div>
            </div>
            <div className="h-1 rounded-full bg-surface-dark-muted mb-3"><div className="h-full w-2/3 rounded-full bg-success" /></div>
            <div className="aviator-bet-columns aviator-muted text-[10px] px-2 pb-2"><span>Player</span><span className="text-right">Bet $</span><span className="text-right">X</span><span className="text-right">Win $</span></div>
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              {visibleBets.map((b, i) => (
                <div key={i} className="aviator-bet-columns aviator-bet-row">
                  <span className="flex items-center gap-1.5 min-w-0"><span className="aviator-avatar">{["⚽", "✈", "🎲", "★"][i % 4]}</span><span>{b.user}</span></span>
                  <span className="text-right">{b.amount.toFixed(2)}</span>
                  <span className={`text-right ${b.cashedAt ? "aviator-positive" : "aviator-muted"}`}>{b.cashedAt ? `${b.cashedAt.toFixed(2)}x` : "—"}</span>
                  <span className={`text-right ${b.win ? "aviator-positive" : "aviator-muted"}`}>{b.win ? b.win.toFixed(2) : "—"}</span>
                </div>
              ))}
            </div>
            <div className="aviator-muted flex justify-between text-[10px] pt-3"><span>Simulated activity</span><span>CrownBet</span></div>
          </aside>
          <div className="aviator-main min-w-0">
            <div className="aviator-history" aria-label="Recent round multipliers">
              {history.map((h, i) => <span key={i} className={h < 2 ? "aviator-history-low" : h < 10 ? "aviator-history-high" : "aviator-history-rare"}>{h.toFixed(2)}x</span>)}
            </div>
            <AviatorFlightStage phase={phase} multiplier={multiplier} countdown={countdown} cashedAt={cashedAt} bet={bet} spectators={liveBets.length} />
            <div className="aviator-controls">
              <div className="text-center text-xs font-semibold aviator-muted">Bet</div>
              <div className="aviator-control-grid">
                <div>
                  <div className="aviator-stake">
                    <Button size="icon" variant="ghost" aria-label="Decrease stake" onClick={() => setBet((b) => Math.max(1, b - 10))} className="aviator-step"><Minus /></Button>
                    <Input aria-label="Bet amount" type="number" value={bet} onChange={(e) => setBet(+e.target.value)} className="aviator-input" />
                    <Button size="icon" variant="ghost" aria-label="Increase stake" onClick={() => setBet((b) => b + 10)} className="aviator-step"><Plus /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {[10, 50, 100, 500].map((v) => <Button key={v} variant="ghost" onClick={() => setBet(v)} className="aviator-preset">{v.toLocaleString()}</Button>)}
                  </div>
                </div>
                <div>
                  {phase === "waiting" && !hasBet && <Button onClick={placeBet} className="aviator-action"><span>Bet<br />${bet.toFixed(2)}</span></Button>}
                  {phase === "waiting" && hasBet && <Button disabled className="aviator-action">Waiting {countdown}s…</Button>}
                  {phase === "running" && hasBet && cashedAt === null && <Button onClick={cashout} className="aviator-action aviator-cashout"><span>Cash out<br />${(bet * multiplier).toFixed(2)}</span></Button>}
                  {phase === "running" && !hasBet && <Button disabled className="aviator-action">Wait for next round</Button>}
                  {phase === "running" && hasBet && cashedAt !== null && <Button disabled className="aviator-action">Cashed out @ {cashedAt.toFixed(2)}x</Button>}
                  {phase === "crashed" && <Button disabled className="aviator-action">Round ended</Button>}
                </div>
              </div>
            </div>
            <details className="aviator-chat">
              <summary><MessageCircle className="inline-block h-4 w-4 mr-2" />Chat</summary>
              <div className="h-36 overflow-y-auto py-3 space-y-1.5 text-xs scrollbar-hide">
                {chat.map((m) => <div key={m.id}><span className={`font-bold ${m.color}`}>{m.user}: </span><span>{m.text}</span></div>)}
              </div>
              <div className="flex gap-2">
                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Say something..." aria-label="Chat message" className="aviator-chat-input" />
                <Button onClick={sendChat} size="icon" aria-label="Send message"><Send className="w-4 h-4" /></Button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Aviator;
