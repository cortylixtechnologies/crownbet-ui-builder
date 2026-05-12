import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Send, RotateCw } from "lucide-react";
import { toast } from "sonner";
import planeImg from "@/assets/aviator-plane.png";

type Phase = "waiting" | "running" | "crashed";
type LiveBet = { user: string; amount: number; cashedAt: number | null; win: number | null };
type ChatMsg = { id: number; user: string; text: string; color: string };

const NAMES = ["a***1", "j***k", "m***z", "p***o", "x***9", "c***t", "r***5", "n***q", "k***l", "0***8", "f***r"];
const COLORS = ["text-rose-400", "text-emerald-400", "text-sky-400", "text-amber-400", "text-fuchsia-400", "text-cyan-400"];
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const Aviator = () => {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(30);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [history, setHistory] = useState<number[]>([1.32, 2.45, 1.08, 5.67, 1.91, 3.21, 1.14, 1.41, 2.82]);
  const [hasBet, setHasBet] = useState(false);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [tab, setTab] = useState<"all" | "previous" | "top">("all");
  const [chat, setChat] = useState<ChatMsg[]>([
    { id: 1, user: "j***k", text: "lets fly 🚀", color: "text-emerald-400" },
    { id: 2, user: "m***z", text: "cashed 5x 🔥", color: "text-amber-400" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const crashRef = useRef(0);
  const rafRef = useRef<number>();
  const startRef = useRef(0);
  const phaseRef = useRef<Phase>("waiting");
  phaseRef.current = phase;

  // Generate fake live bets at start of each round
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

  // Place bet (only during waiting phase)
  const placeBet = () => {
    if (phase !== "waiting") return toast.error("Wait for next round");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    setBalance((b) => b - bet);
    setHasBet(true);
    setCashedAt(null);
    toast.success(`Bet placed: $${bet}`);
  };

  const cancelBet = () => {
    if (phase !== "waiting" || !hasBet) return;
    setBalance((b) => b + bet);
    setHasBet(false);
  };

  const cashout = () => {
    if (phase !== "running" || !hasBet || cashedAt !== null) return;
    const win = +(bet * multiplier).toFixed(2);
    setBalance((b) => b + win);
    setCashedAt(multiplier);
    toast.success(`Cashed out ${multiplier.toFixed(2)}x → +$${win}`);
  };

  // Round loop
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
      crashRef.current = Math.max(1.01, +(1 / (1 - r * 0.97)).toFixed(2));
      startRef.current = performance.now();
      setPhase("running");
      const tick = (t: number) => {
        const elapsed = (t - startRef.current) / 1000;
        const m = +Math.exp(elapsed * 0.35).toFixed(2);
        // simulate other players cashing out
        setLiveBets((prev) =>
          prev.map((b) => {
            if (b.cashedAt === null && Math.random() < 0.008 && m < crashRef.current) {
              return { ...b, cashedAt: m, win: +(b.amount * m).toFixed(2) };
            }
            return b;
          })
        );
        if (m >= crashRef.current) {
          setMultiplier(crashRef.current);
          setHistory((h) => [crashRef.current, ...h].slice(0, 12));
          setPhase("crashed");
          timer = setTimeout(() => {
            setHasBet(false);
            setCashedAt(null);
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

  // Auto-loss when crashed without cashout
  useEffect(() => {
    if (phase === "crashed" && hasBet && cashedAt === null) {
      toast.error(`Crashed at ${crashRef.current.toFixed(2)}x`);
    }
  }, [phase, hasBet, cashedAt]);

  // Random chat
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

  const totalBet = liveBets.reduce((s, b) => s + b.amount, 0);
  const totalWin = liveBets.reduce((s, b) => s + (b.win ?? 0), 0);

  const visibleBets =
    tab === "previous" ? liveBets.filter((b) => b.cashedAt !== null) :
    tab === "top" ? [...liveBets].sort((a, b) => (b.win ?? 0) - (a.win ?? 0)).slice(0, 30) :
    liveBets;

  return (
    <AppLayout>
      <div className="bg-surface-dark text-white min-h-[calc(100vh-120px)]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-rose-500 font-extrabold italic text-xl">
            <Plane className="w-5 h-5" /> Aviator
          </div>
          <div className="text-gold font-bold">${balance.toFixed(2)}</div>
        </div>

        {/* History strip */}
        <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b border-white/10 scrollbar-hide">
          {history.map((h, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${h < 2 ? "text-sky-400" : h < 10 ? "text-fuchsia-400" : "text-rose-400"}`}>
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_260px] gap-2 p-2">
          {/* Live bets panel */}
          <div className="bg-surface-dark-muted rounded-xl border border-white/10 flex flex-col text-xs max-h-[420px] lg:max-h-[600px]">
            <div className="flex border-b border-white/10">
              {(["all", "previous", "top"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 capitalize font-bold ${tab === t ? "bg-white/10 text-white" : "text-white/60"}`}>
                  {t === "all" ? "All Bets" : t}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold">{liveBets.length} <span className="text-white/50 font-normal">Bets</span></div>
              </div>
              <div className="text-right">
                <div className="text-gold font-bold">${totalWin.toFixed(2)}</div>
                <div className="text-white/50 text-[10px]">Total win</div>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_60px_50px_60px] px-3 py-1 text-white/50 text-[10px] border-b border-white/5">
              <span>Player</span><span className="text-right">Bet</span><span className="text-right">x</span><span className="text-right">Win</span>
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              {visibleBets.map((b, i) => (
                <div key={i} className={`grid grid-cols-[1fr_60px_50px_60px] px-3 py-1.5 border-b border-white/5 ${b.cashedAt ? "bg-success/5" : ""}`}>
                  <span className="text-white/80">{b.user}</span>
                  <span className="text-right">${b.amount}</span>
                  <span className={`text-right ${b.cashedAt ? "text-success" : "text-white/30"}`}>{b.cashedAt ? `${b.cashedAt.toFixed(2)}x` : "-"}</span>
                  <span className={`text-right ${b.win ? "text-success font-bold" : "text-white/30"}`}>{b.win ? b.win.toFixed(2) : "-"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Game canvas + bet panel */}
          <div className="space-y-2">
            <div className="relative h-72 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-rose-950 overflow-hidden flex items-center justify-center border border-white/10">
              {/* radial rays */}
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_70%,transparent_0%,#000_70%)]" />
              <Plane
                className={`absolute w-14 h-14 text-rose-500 transition-transform duration-100 ${phase === "crashed" ? "opacity-30" : ""}`}
                style={{
                  transform: phase === "running"
                    ? `translate(${Math.min(multiplier * 35, 240)}px, ${-Math.min(multiplier * 28, 160)}px) rotate(-25deg)`
                    : phase === "crashed" ? "translate(260px, -180px) rotate(40deg)" : "translate(-120px, 60px) rotate(-10deg)",
                }}
              />
              <div className="text-center z-10">
                {phase === "waiting" && (
                  <>
                    <div className="text-white/70 text-sm font-bold mb-2 tracking-widest">NEXT ROUND IN</div>
                    <div className="text-6xl font-black text-gold">{countdown}s</div>
                    <RotateCw className="w-5 h-5 text-white/40 animate-spin mx-auto mt-3" />
                  </>
                )}
                {phase === "running" && (
                  <div className="text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {multiplier.toFixed(2)}x
                  </div>
                )}
                {phase === "crashed" && (
                  <>
                    <div className="text-rose-500 font-extrabold text-2xl tracking-widest mb-1">FLEW AWAY!</div>
                    <div className="text-6xl font-black text-rose-500">{multiplier.toFixed(2)}x</div>
                  </>
                )}
                {cashedAt !== null && phase !== "waiting" && (
                  <div className="mt-3 inline-block bg-success/20 border border-success rounded-lg px-3 py-1 text-success font-bold">
                    Won ${(bet * cashedAt).toFixed(2)} @ {cashedAt.toFixed(2)}x
                  </div>
                )}
              </div>
            </div>

            {/* Bet panel */}
            <div className="bg-surface-dark-muted rounded-xl p-3 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setBet((b) => Math.max(1, b - 10))} className="border-white/20 text-white">−</Button>
                <Input type="number" value={bet} onChange={(e) => setBet(+e.target.value)}
                  className="bg-surface-dark border-white/10 text-white text-center font-bold" />
                <Button size="sm" variant="outline" onClick={() => setBet((b) => b + 10)} className="border-white/20 text-white">+</Button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[10, 50, 100, 500].map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded py-1 text-xs font-bold">
                    ${v}
                  </button>
                ))}
              </div>
              {phase === "waiting" && !hasBet && (
                <Button onClick={placeBet} className="w-full bg-success hover:bg-success/90 h-14 text-lg font-extrabold">
                  BET ${bet.toFixed(2)}
                </Button>
              )}
              {phase === "waiting" && hasBet && (
                <Button onClick={cancelBet} className="w-full bg-rose-600 hover:bg-rose-700 h-14 text-lg font-extrabold">
                  CANCEL (waiting {countdown}s)
                </Button>
              )}
              {phase === "running" && hasBet && cashedAt === null && (
                <Button onClick={cashout} className="w-full bg-gold text-gold-foreground hover:bg-gold/90 h-14 text-lg font-extrabold animate-pulse">
                  CASH OUT ${(bet * multiplier).toFixed(2)}
                </Button>
              )}
              {phase === "running" && !hasBet && (
                <Button disabled className="w-full bg-white/10 h-14 text-base font-bold text-white/50">
                  WAIT FOR NEXT ROUND
                </Button>
              )}
              {phase === "running" && hasBet && cashedAt !== null && (
                <Button disabled className="w-full bg-success/20 text-success h-14 text-base font-bold">
                  CASHED OUT @ {cashedAt.toFixed(2)}x
                </Button>
              )}
              {phase === "crashed" && (
                <Button disabled className="w-full bg-rose-900/40 text-rose-300 h-14 text-base font-bold">
                  ROUND ENDED
                </Button>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-surface-dark-muted rounded-xl border border-white/10 flex flex-col max-h-[420px] lg:max-h-[600px]">
            <div className="px-3 py-2 border-b border-white/10 font-bold text-sm">💬 Chat</div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 text-xs scrollbar-hide">
              {chat.map((m) => (
                <div key={m.id}>
                  <span className={`font-bold ${m.color}`}>{m.user}: </span>
                  <span className="text-white/80">{m.text}</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-white/10 flex gap-1">
              <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Say something..."
                className="bg-surface-dark border-white/10 text-white text-xs h-9" />
              <Button onClick={sendChat} size="icon" className="h-9 w-9 bg-primary"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Aviator;
