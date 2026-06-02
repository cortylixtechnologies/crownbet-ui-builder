import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bomb, Gem } from "lucide-react";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

const SIZE = 25;

const Mines = () => {
  const { minesStart, minesPick, minesCashout, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(10);
  const [stake, setStake] = useState(0);
  const [mineCount, setMineCount] = useState(3);
  const [revealed, setRevealed] = useState<Map<number, boolean>>(new Map()); // tile -> isMine
  const [roundId, setRoundId] = useState<string | null>(null);
  const [mult, setMult] = useState(1);
  const [active, setActive] = useState(false);
  const safeRevealed = Array.from(revealed.values()).filter((v) => !v).length;

  const start = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    const res = await minesStart(bet, mineCount);
    if (!res) return;
    setStake(bet);
    setRoundId(res.round_id);
    setRevealed(new Map());
    setMult(1);
    setActive(true);
  };

  const click = async (i: number) => {
    if (!active || !roundId || revealed.has(i)) return;
    const res = await minesPick(roundId, i);
    if (!res) return;
    setRevealed((prev) => new Map(prev).set(i, res.hit_mine));
    if (res.hit_mine) {
      setActive(false);
      toast.error("Boom! Hit a mine");
    } else {
      setMult(Number(res.multiplier));
    }
  };

  const cashout = async () => {
    if (!active || !roundId || safeRevealed === 0) return;
    const res = await minesCashout(roundId);
    if (!res) return;
    toast.success(`Cashed out $${res.payout} (${res.multiplier}x)`);
    setActive(false);
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-orange-900 to-surface-dark text-white p-4 space-y-4 min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Bomb className="w-6 h-6 text-gold" /> Mines</h1>
          <div className="text-sm">Balance: <span className="font-bold text-gold">${balance.toFixed(2)}</span></div>
        </div>

        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
          {Array.from({ length: SIZE }).map((_, i) => {
            const isRev = revealed.has(i);
            const isMine = revealed.get(i);
            return (
              <button key={i} onClick={() => click(i)} disabled={!active}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition ${
                  isRev ? (isMine ? "bg-primary" : "bg-success") : "bg-white/10 hover:bg-white/20"
                }`}>
                {isRev ? (isMine ? <Bomb className="w-6 h-6" /> : <Gem className="w-6 h-6" />) : ""}
              </button>
            );
          })}
        </div>

        <div className="bg-surface-dark-muted rounded-xl p-4 space-y-3">
          {!active ? (
            <>
              <div className="flex gap-2 items-center">
                <span className="text-sm">Bet:</span>
                <Input type="number" value={bet} onChange={(e) => setBet(+e.target.value)} className="bg-surface-dark border-white/10 text-white w-28" />
                <span className="text-sm ml-2">Mines:</span>
                <Input type="number" min={1} max={24} value={mineCount} onChange={(e) => setMineCount(Math.max(1, Math.min(24, +e.target.value)))} className="bg-surface-dark border-white/10 text-white w-20" />
              </div>
              <Button onClick={start} className="w-full bg-success h-14 text-lg font-extrabold">START GAME</Button>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span>Revealed: {safeRevealed}</span>
                <span className="text-gold font-bold">{mult}x → ${(stake * mult).toFixed(2)}</span>
              </div>
              <Button onClick={cashout} disabled={safeRevealed === 0} className="w-full bg-gold text-gold-foreground h-14 text-lg font-extrabold">CASH OUT</Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Mines;
