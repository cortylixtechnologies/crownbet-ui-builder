import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const cardLabel = (v: number) => v === 1 ? "A" : v === 11 ? "J" : v === 12 ? "Q" : v === 13 ? "K" : String(v);
const handValue = (h: number[]) => {
  let t = 0, a = 0;
  for (const c of h) { if (c === 1) { t += 11; a++; } else if (c >= 10) t += 10; else t += c; }
  while (t > 21 && a > 0) { t -= 10; a--; }
  return t;
};

const Card3D = ({ v, hide }: { v?: number; hide?: boolean }) => (
  <div className={`w-14 h-20 rounded-lg border-2 grid place-items-center text-2xl font-extrabold ${hide ? "bg-rose-700 text-white" : "bg-white text-zinc-900 border-zinc-800"}`}>
    {hide ? "?" : cardLabel(v!)}
  </div>
);

const Blackjack = () => {
  const { profile, refreshProfile } = useAuth();
  const [stake, setStake] = useState(20);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [player, setPlayer] = useState<number[]>([]);
  const [dealer, setDealer] = useState<number[]>([]);
  const [dealerUp, setDealerUp] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("blackjack_start", { _stake: stake });
    setBusy(false);
    if (error) return toast.error(error.message);
    const r: any = Array.isArray(data) ? data[0] : data;
    setRoundId(r.round_id); setPlayer(r.player); setDealer([]); setDealerUp(r.dealer_up);
    setStatus(r.status);
    refreshProfile();
    if (r.status === "blackjack") toast.success("Blackjack! 3:2 payout");
  };

  const hit = async () => {
    if (!roundId) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("blackjack_hit", { _round_id: roundId });
    setBusy(false);
    if (error) return toast.error(error.message);
    const r: any = Array.isArray(data) ? data[0] : data;
    setPlayer(r.player); setStatus(r.status);
    if (r.status === "bust") { toast.error("Bust!"); setRoundId(null); }
  };

  const stand = async () => {
    if (!roundId) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("blackjack_stand", { _round_id: roundId });
    setBusy(false);
    if (error) return toast.error(error.message);
    const r: any = Array.isArray(data) ? data[0] : data;
    setPlayer(r.player); setDealer(r.dealer); setDealerUp(null); setStatus(r.status);
    refreshProfile();
    if (r.status === "won") toast.success(`You win! +${r.payout}`);
    else if (r.status === "push") toast("Push");
    else toast.error("Dealer wins");
    setRoundId(null);
  };

  const active = !!roundId && status === "active";

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">🃏 Blackjack</h1>
          <div className="text-sm text-muted-foreground">Balance: <b>{profile?.balance ?? 0}</b></div>
        </div>

        <Card className="p-6 space-y-6 bg-emerald-900 text-white">
          <div>
            <p className="text-xs uppercase opacity-70">Dealer {dealer.length ? `(${handValue(dealer)})` : ""}</p>
            <div className="flex gap-2 mt-2">
              {dealer.length ? dealer.map((c,i)=><Card3D key={i} v={c} />)
                : dealerUp !== null ? (<><Card3D v={dealerUp} /><Card3D hide /></>) : null}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase opacity-70">You {player.length ? `(${handValue(player)})` : ""}</p>
            <div className="flex gap-2 mt-2">
              {player.map((c,i)=><Card3D key={i} v={c} />)}
            </div>
          </div>
        </Card>

        {!roundId && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Stake</label>
              <Input type="number" value={stake} onChange={(e) => setStake(+e.target.value)} className="mt-1" />
            </div>
            <Button onClick={start} disabled={busy} className="w-full h-12 font-extrabold">Deal</Button>
          </>
        )}

        {active && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={hit} disabled={busy} variant="secondary" className="h-12 font-extrabold">Hit</Button>
            <Button onClick={stand} disabled={busy} className="h-12 font-extrabold">Stand</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Blackjack;
