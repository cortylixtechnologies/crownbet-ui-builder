import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bomb, Gem } from "lucide-react";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

const SIZE = 25;

const newBoard = (mines: number) => {
  const idx = new Set<number>();
  while (idx.size < mines) idx.add(Math.floor(Math.random() * SIZE));
  return Array.from({ length: SIZE }, (_, i) => idx.has(i));
};

const Mines = () => {
  const { play, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(10);
  const [stake, setStake] = useState(0);
  const [mineCount, setMineCount] = useState(3);
  const [board, setBoard] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(false);
  const [dead, setDead] = useState(false);

  const safeRevealed = revealed.size;
  let mult = 1;
  for (let i = 0; i < safeRevealed; i++) {
    mult *= (SIZE - i) / (SIZE - mineCount - i);
  }
  mult = +(mult * 0.97).toFixed(2);

  const start = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    // Debit stake immediately (payout=0). Win paid out on cashout.
    const res = await play({ game: "mines", stake: bet, payout: 0, multiplier: 0, meta: { phase: "start", mines: mineCount } });
    if (!res.ok) return;
    setStake(bet);
    setBoard(newBoard(mineCount));
    setRevealed(new Set());
    setActive(true);
    setDead(false);
  };

  const click = (i: number) => {
    if (!active || revealed.has(i)) return;
    if (board[i]) {
      setRevealed(new Set([...revealed, i]));
      setDead(true);
      setActive(false);
      toast.error("Boom! Hit a mine");
      return;
    }
    setRevealed(new Set([...revealed, i]));
  };

  const cashout = async () => {
    if (!active || safeRevealed === 0) return;
    const win = +(stake * mult).toFixed(2);
    // Already debited at start. Now credit winnings with stake=0.
    const res = await play({ game: "mines", stake: 0, payout: win, multiplier: mult, meta: { phase: "cashout", revealed: safeRevealed } });
    if (!res.ok) return;
    toast.success(`Cashed out $${win} (${mult}x)`);
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
            const isMine = board[i];
            const showMine = (dead || !active) && isMine && board.length > 0;
            return (
              <button key={i} onClick={() => click(i)} disabled={!active}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition ${
                  isRev ? isMine ? "bg-primary" : "bg-success" : showMine ? "bg-primary/40" : "bg-white/10 hover:bg-white/20"
                }`}>
                {isRev || showMine ? (isMine ? <Bomb className="w-6 h-6" /> : <Gem className="w-6 h-6" />) : ""}
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
