import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dice5 } from "lucide-react";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

const Dice = () => {
  const { play, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(10);
  const [target, setTarget] = useState(50);
  const [over, setOver] = useState(true);
  const [roll, setRoll] = useState<number | null>(null);

  const winChance = over ? (99 - target) : target;
  const multiplier = winChance > 0 ? +(98 / winChance).toFixed(2) : 0;

  const playRound = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    if (winChance < 1) return toast.error("Adjust target");
    const r = +(Math.random() * 100).toFixed(2);
    setRoll(r);
    const win = over ? r > target : r < target;
    const payout = win ? +(bet * multiplier).toFixed(2) : 0;
    const res = await play({ game: "dice", stake: bet, payout, multiplier: win ? multiplier : 0, meta: { roll: r, target, over } });
    if (!res.ok) return;
    if (win) toast.success(`Rolled ${r} — won $${payout}`);
    else toast.error(`Rolled ${r} — lost`);
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-purple-900 to-surface-dark text-white p-4 space-y-4 min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Dice5 className="w-6 h-6 text-gold" /> Dice Roll</h1>
          <div className="text-sm">Balance: <span className="font-bold text-gold">${balance.toFixed(2)}</span></div>
        </div>

        <div className="text-center py-6">
          <div className="text-7xl font-black text-gold">{roll?.toFixed(2) ?? "—"}</div>
          <p className="text-white/60 text-sm mt-2">Last roll</p>
        </div>

        <div className="bg-surface-dark-muted rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setOver(false)} className={`${!over ? "bg-primary" : "bg-white/10"}`}>Roll Under {target}</Button>
            <Button onClick={() => setOver(true)} className={`${over ? "bg-primary" : "bg-white/10"}`}>Roll Over {target}</Button>
          </div>
          <div>
            <input type="range" min={1} max={98} value={target} onChange={(e) => setTarget(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Target: {target}</span>
              <span>Win Chance: {winChance}%</span>
              <span>Payout: {multiplier}x</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm">Bet:</span>
            <Input type="number" value={bet} onChange={(e) => setBet(+e.target.value)} className="bg-surface-dark border-white/10 text-white w-28" />
          </div>
          <Button onClick={playRound} className="w-full bg-success h-14 text-lg font-extrabold">ROLL DICE</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dice;
