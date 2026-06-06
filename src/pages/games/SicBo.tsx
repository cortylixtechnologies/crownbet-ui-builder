import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Bet = { type: string; value?: number; stake: number; label: string };

const SicBo = () => {
  const { profile, refreshProfile } = useAuth();
  const [stake, setStake] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [dice, setDice] = useState<number[] | null>(null);
  const [rolling, setRolling] = useState(false);

  const total = bets.reduce((s, b) => s + b.stake, 0);
  const add = (b: Omit<Bet, "stake">) => setBets((p) => [...p, { ...b, stake }]);

  const play = async () => {
    if (!bets.length) return toast.error("Place a bet first");
    setRolling(true);
    const { data, error } = await supabase.rpc("play_sicbo", { _bets: bets as any });
    setRolling(false);
    if (error) return toast.error(error.message);
    const row: any = Array.isArray(data) ? data[0] : data;
    setDice([row.d1, row.d2, row.d3]);
    refreshProfile();
    if (row.total_payout > 0) toast.success(`Dice ${row.d1}-${row.d2}-${row.d3} — won ${row.total_payout}`);
    else toast(`Dice ${row.d1}-${row.d2}-${row.d3} — no win`);
    setBets([]);
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">🎲 Sic Bo</h1>
          <div className="text-sm text-muted-foreground">Balance: <b>{profile?.balance ?? 0}</b></div>
        </div>

        <Card className="p-6">
          <div className="flex justify-center gap-3">
            {(dice ?? [1,2,3]).map((d, i) => (
              <div key={i} className={`w-20 h-20 rounded-lg bg-white border-2 border-zinc-800 grid place-items-center text-4xl font-extrabold ${rolling?"animate-bounce":""}`}>
                {d}
              </div>
            ))}
          </div>
        </Card>

        <div>
          <label className="text-xs text-muted-foreground">Stake per bet</label>
          <Input type="number" value={stake} onChange={(e) => setStake(+e.target.value)} className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => add({ type:"small", label:"Small (4-10)" })} className="bg-emerald-700 text-white font-bold py-3 rounded">Small</button>
          <button onClick={() => add({ type:"big", label:"Big (11-17)" })} className="bg-emerald-700 text-white font-bold py-3 rounded">Big</button>
          <button onClick={() => add({ type:"odd", label:"Odd" })} className="bg-zinc-800 text-white font-bold py-3 rounded">Odd</button>
          <button onClick={() => add({ type:"even", label:"Even" })} className="bg-zinc-800 text-white font-bold py-3 rounded">Even</button>
          <button onClick={() => add({ type:"any_triple", label:"Any Triple (30x)" })} className="col-span-2 bg-amber-600 text-white font-bold py-3 rounded">Any Triple</button>
        </div>

        <div>
          <h3 className="font-bold mb-2 text-sm">Single die</h3>
          <div className="grid grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map((n) => (
              <button key={n} onClick={() => add({ type:"single", value:n, label:`Single ${n}` })}
                className="aspect-square bg-card border rounded font-bold text-lg">{n}</button>
            ))}
          </div>
        </div>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Your bets ({bets.length})</span>
            <button onClick={() => setBets([])} className="text-xs text-muted-foreground">Clear</button>
          </div>
          {bets.length === 0 ? <p className="text-xs text-muted-foreground">No bets yet</p> : (
            <ul className="space-y-1 text-sm">
              {bets.map((b,i)=>(<li key={i} className="flex justify-between"><span>{b.label}</span><span className="font-bold">{b.stake}</span></li>))}
              <li className="flex justify-between pt-2 border-t font-bold"><span>Total</span><span>{total}</span></li>
            </ul>
          )}
        </Card>

        <Button onClick={play} disabled={!bets.length || rolling} className="w-full h-12 text-lg font-extrabold">
          {rolling ? "Rolling..." : `Roll (${total})`}
        </Button>
      </div>
    </AppLayout>
  );
};

export default SicBo;
