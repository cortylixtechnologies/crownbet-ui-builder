import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane } from "lucide-react";
import { toast } from "sonner";

type State = "idle" | "running" | "crashed";

const Aviator = () => {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [state, setState] = useState<State>("idle");
  const [multiplier, setMultiplier] = useState(1);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([1.32, 2.45, 1.08, 5.67, 1.91, 3.21]);
  const crashRef = useRef(0);
  const rafRef = useRef<number>();
  const startRef = useRef(0);

  const start = () => {
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    setBalance((b) => b - bet);
    setCashedAt(null);
    setMultiplier(1);
    // crash point with house edge: weighted random
    const r = Math.random();
    crashRef.current = Math.max(1.01, +(1 / (1 - r * 0.97)).toFixed(2));
    startRef.current = performance.now();
    setState("running");
  };

  const cashout = () => {
    if (state !== "running") return;
    const win = +(bet * multiplier).toFixed(2);
    setBalance((b) => b + win);
    setCashedAt(multiplier);
    toast.success(`Cashed out ${multiplier.toFixed(2)}x → +$${win}`);
    setState("crashed");
    setHistory((h) => [+multiplier.toFixed(2), ...h].slice(0, 10));
  };

  useEffect(() => {
    if (state !== "running") return;
    const tick = (t: number) => {
      const elapsed = (t - startRef.current) / 1000;
      const m = +(Math.exp(elapsed * 0.35)).toFixed(2);
      if (m >= crashRef.current) {
        setMultiplier(crashRef.current);
        setState("crashed");
        setHistory((h) => [crashRef.current, ...h].slice(0, 10));
        if (cashedAt === null) toast.error(`Crashed at ${crashRef.current.toFixed(2)}x`);
        return;
      }
      setMultiplier(m);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state, cashedAt]);

  const reset = () => { setState("idle"); setMultiplier(1); setCashedAt(null); };

  return (
    <AppLayout>
      <div className="bg-surface-dark text-white p-4 space-y-4 min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Plane className="w-6 h-6 text-gold" /> Aviator</h1>
          <div className="text-sm">Balance: <span className="font-bold text-gold">${balance.toFixed(2)}</span></div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {history.map((h, i) => (
            <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${h < 2 ? "bg-primary/30 text-primary" : h < 5 ? "bg-success/30 text-success" : "bg-gold/30 text-gold"}`}>
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        <div className="relative h-64 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 overflow-hidden flex items-center justify-center">
          <Plane
            className={`absolute w-12 h-12 text-gold transition-all duration-100 ${state === "crashed" ? "opacity-30 rotate-180" : ""}`}
            style={{
              transform: state === "running"
                ? `translate(${Math.min(multiplier * 30, 200)}px, ${-Math.min(multiplier * 25, 150)}px) rotate(-20deg)`
                : "translate(-100px, 50px)",
            }}
          />
          <div className="text-center z-10">
            <div className={`text-6xl font-black ${state === "crashed" ? "text-primary" : "text-white"}`}>
              {multiplier.toFixed(2)}x
            </div>
            {state === "crashed" && cashedAt === null && <div className="text-primary font-bold mt-2">FLEW AWAY!</div>}
            {cashedAt !== null && <div className="text-success font-bold mt-2">Won ${(bet * cashedAt).toFixed(2)}</div>}
          </div>
        </div>

        <div className="bg-surface-dark-muted rounded-xl p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <span className="text-sm">Bet:</span>
            <Input
              type="number"
              value={bet}
              onChange={(e) => setBet(+e.target.value)}
              disabled={state === "running"}
              className="bg-surface-dark border-white/10 text-white w-28"
            />
            {[10, 50, 100].map((v) => (
              <Button key={v} size="sm" variant="outline" onClick={() => setBet(v)} disabled={state === "running"} className="border-white/20 text-white">
                ${v}
              </Button>
            ))}
          </div>
          {state === "idle" && <Button onClick={start} className="w-full bg-success hover:bg-success/90 h-14 text-lg font-extrabold">PLACE BET</Button>}
          {state === "running" && <Button onClick={cashout} className="w-full bg-gold text-gold-foreground hover:bg-gold/90 h-14 text-lg font-extrabold animate-pulse">CASH OUT @ {multiplier.toFixed(2)}x</Button>}
          {state === "crashed" && <Button onClick={reset} className="w-full bg-primary h-14 text-lg font-extrabold">PLAY AGAIN</Button>}
        </div>
      </div>
    </AppLayout>
  );
};

export default Aviator;
