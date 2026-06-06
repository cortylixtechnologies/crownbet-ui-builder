import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Bet = { type: string; value?: number; stake: number; label: string };

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const OUTSIDE = [
  { type: "red",    label: "Red",    color: "bg-red-600" },
  { type: "black",  label: "Black",  color: "bg-zinc-900" },
  { type: "odd",    label: "Odd",    color: "bg-emerald-700" },
  { type: "even",   label: "Even",   color: "bg-emerald-700" },
  { type: "low",    label: "1-18",   color: "bg-emerald-700" },
  { type: "high",   label: "19-36",  color: "bg-emerald-700" },
  { type: "dozen1", label: "1-12",   color: "bg-emerald-700" },
  { type: "dozen2", label: "13-24",  color: "bg-emerald-700" },
  { type: "dozen3", label: "25-36",  color: "bg-emerald-700" },
];

const Roulette = () => {
  const { profile, refreshProfile } = useAuth();
  const [stake, setStake] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [spin, setSpin] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const total = bets.reduce((s, b) => s + b.stake, 0);

  const addBet = (b: Omit<Bet, "stake">) => {
    setBets((prev) => [...prev, { ...b, stake }]);
  };
  const clearBets = () => setBets([]);

  const play = async () => {
    if (!bets.length) return toast.error("Place a bet first");
    setSpinning(true);
    const { data, error } = await supabase.rpc("play_roulette", { _bets: bets as any });
    setSpinning(false);
    if (error) return toast.error(error.message);
    const row: any = Array.isArray(data) ? data[0] : data;
    setSpin(row.spin);
    refreshProfile();
    if (row.total_payout > 0) toast.success(`Spin ${row.spin} — won ${row.total_payout}`);
    else toast(`Spin ${row.spin} — no win`);
    setBets([]);
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">🎡 Roulette</h1>
          <div className="text-sm text-muted-foreground">Balance: <b>{profile?.balance ?? 0}</b></div>
        </div>

        <Card className="p-6 text-center">
          <div className={`mx-auto w-32 h-32 rounded-full grid place-items-center text-4xl font-extrabold text-white ${
            spin === null ? "bg-zinc-700" : spin === 0 ? "bg-emerald-600" : RED.has(spin) ? "bg-red-600" : "bg-zinc-900"
          } ${spinning ? "animate-spin" : ""}`}>
            {spin ?? "?"}
          </div>
        </Card>

        <div>
          <label className="text-xs text-muted-foreground">Stake per bet</label>
          <Input type="number" value={stake} onChange={(e) => setStake(+e.target.value)} className="mt-1" />
        </div>

        <div>
          <h3 className="font-bold mb-2 text-sm">Numbers</h3>
          <div className="grid grid-cols-7 gap-1">
            <button onClick={() => addBet({ type:"straight", value:0, label:"0" })}
              className="aspect-square rounded bg-emerald-600 text-white font-bold text-sm">0</button>
            {Array.from({length:36},(_,i)=>i+1).map((n) => (
              <button key={n} onClick={() => addBet({ type:"straight", value:n, label:String(n) })}
                className={`aspect-square rounded text-white font-bold text-sm ${RED.has(n)?"bg-red-600":"bg-zinc-900"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {OUTSIDE.map((o) => (
            <button key={o.type} onClick={() => addBet({ type:o.type, label:o.label })}
              className={`${o.color} text-white font-bold py-3 rounded`}>{o.label}</button>
          ))}
        </div>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Your bets ({bets.length})</span>
            <button onClick={clearBets} className="text-xs text-muted-foreground">Clear</button>
          </div>
          {bets.length === 0 ? (
            <p className="text-xs text-muted-foreground">No bets yet</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {bets.map((b,i)=>(
                <li key={i} className="flex justify-between">
                  <span>{b.label}</span><span className="font-bold">{b.stake}</span>
                </li>
              ))}
              <li className="flex justify-between pt-2 border-t font-bold">
                <span>Total</span><span>{total}</span>
              </li>
            </ul>
          )}
        </Card>

        <Button onClick={play} disabled={!bets.length || spinning} className="w-full h-12 text-lg font-extrabold">
          {spinning ? "Spinning..." : `Spin (${total})`}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Roulette;
