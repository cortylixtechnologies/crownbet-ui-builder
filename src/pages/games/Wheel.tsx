import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disc3 } from "lucide-react";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

const segments = [
  { mult: 0, color: "#1f2937" },
  { mult: 1.5, color: "#22c55e" },
  { mult: 2, color: "#3b82f6" },
  { mult: 0, color: "#1f2937" },
  { mult: 5, color: "#a855f7" },
  { mult: 1.5, color: "#22c55e" },
  { mult: 0, color: "#1f2937" },
  { mult: 10, color: "#f59e0b" },
];

const Wheel = () => {
  const { wheel, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(10);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    setSpinning(true);
    const res = await wheel(bet);
    if (!res) { setSpinning(false); return; }
    const i = res.segment;
    const segAng = 360 / segments.length;
    const finalAngle = 360 * 6 + (360 - i * segAng - segAng / 2);
    setAngle(finalAngle);
    setTimeout(() => {
      setSpinning(false);
      setAngle(finalAngle % 360);
      if (res.payout > 0) toast.success(`${res.multiplier}x — won $${res.payout}!`);
      else toast.error("No win this time");
    }, 4200);
  };

  const segAngle = 360 / segments.length;

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-900 to-surface-dark text-white p-4 space-y-4 min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Disc3 className="w-6 h-6 text-gold" /> Lucky Wheel</h1>
          <div className="text-sm">Balance: <span className="font-bold text-gold">${balance.toFixed(2)}</span></div>
        </div>

        <div className="relative mx-auto w-64 h-64">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-gold" />
          <div
            className="w-64 h-64 rounded-full overflow-hidden shadow-elevated"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              background: `conic-gradient(${segments.map((s, i) => `${s.color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(",")})`,
            }}
          >
            {segments.map((s, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 origin-left text-xs font-black text-white"
                style={{ transform: `rotate(${i * segAngle + segAngle / 2}deg) translateX(60px)` }}>
                {s.mult > 0 ? `${s.mult}x` : "—"}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-dark-muted rounded-xl p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <span className="text-sm">Bet:</span>
            <Input type="number" value={bet} onChange={(e) => setBet(+e.target.value)} className="bg-surface-dark border-white/10 text-white w-28" />
          </div>
          <Button onClick={spin} disabled={spinning} className="w-full bg-success h-14 text-lg font-extrabold">{spinning ? "Spinning…" : "SPIN"}</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Wheel;
