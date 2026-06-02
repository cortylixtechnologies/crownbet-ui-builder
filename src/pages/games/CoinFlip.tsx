import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import { usePlayGame } from "@/hooks/usePlayGame";

const CoinFlip = () => {
  const { coinflip, balance, signedIn } = usePlayGame();
  const [bet, setBet] = useState(10);
  const [pick, setPick] = useState<"H" | "T">("H");
  const [result, setResult] = useState<"H" | "T" | null>(null);
  const [spinning, setSpinning] = useState(false);

  const flip = async () => {
    if (!signedIn) return toast.error("Please sign in");
    if (bet <= 0 || bet > balance) return toast.error("Invalid bet");
    setSpinning(true);
    setResult(null);
    const res = await coinflip(bet, pick);
    setTimeout(() => {
      setSpinning(false);
      if (!res) return;
      setResult(res.result as "H" | "T");
      if (res.won) toast.success(`You won $${res.payout}!`);
      else toast.error("You lost");
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-amber-900 to-surface-dark text-white p-4 space-y-4 min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><Coins className="w-6 h-6 text-gold" /> Coin Flip</h1>
          <div className="text-sm">Balance: <span className="font-bold text-gold">${balance.toFixed(2)}</span></div>
        </div>

        <div className="flex justify-center py-10">
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-amber-700 flex items-center justify-center text-6xl font-black text-amber-900 shadow-elevated ${spinning ? "animate-spin" : ""}`}>
            {result ?? "?"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setPick("H")} className={`h-14 ${pick === "H" ? "bg-gold text-gold-foreground" : "bg-white/10"}`}>HEADS (2x)</Button>
          <Button onClick={() => setPick("T")} className={`h-14 ${pick === "T" ? "bg-gold text-gold-foreground" : "bg-white/10"}`}>TAILS (2x)</Button>
        </div>

        <div className="bg-surface-dark-muted rounded-xl p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <span className="text-sm">Bet:</span>
            <Input type="number" value={bet} onChange={(e) => setBet(+e.target.value)} className="bg-surface-dark border-white/10 text-white w-28" />
          </div>
          <Button onClick={flip} disabled={spinning} className="w-full bg-success hover:bg-success/90 h-14 text-lg font-extrabold">FLIP COIN</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CoinFlip;
