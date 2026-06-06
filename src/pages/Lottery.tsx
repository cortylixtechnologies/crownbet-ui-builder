import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Draw = {
  id: string; draw_no: number; ticket_price: number;
  jackpot: number; prize_pool: number; draw_at: string;
  winning_numbers: number[] | null; status: string;
};

const Lottery = () => {
  const { user, refreshProfile } = useAuth();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [picks, setPicks] = useState<number[]>([]);

  const load = async () => {
    const { data } = await supabase.from("lottery_draws").select("*")
      .order("draw_at", { ascending: true }).limit(20);
    setDraws((data ?? []) as Draw[]);
    if (data?.[0]) setActiveId((d) => d ?? data[0].id);
  };
  useEffect(() => { load(); }, []);

  const active = draws.find((d) => d.id === activeId);
  const togglePick = (n: number) => {
    setPicks((p) => p.includes(n) ? p.filter((x) => x !== n) : p.length < 6 ? [...p, n] : p);
  };
  const quickPick = () => {
    const set = new Set<number>();
    while (set.size < 6) set.add(Math.floor(Math.random() * 49) + 1);
    setPicks([...set].sort((a,b)=>a-b));
  };

  const buy = async () => {
    if (!user) return toast.error("Sign in to play");
    if (picks.length !== 6 || !active) return toast.error("Pick 6 numbers");
    const { error } = await supabase.rpc("lottery_buy_ticket",
      { _draw_id: active.id, _numbers: picks });
    if (error) return toast.error(error.message);
    toast.success("Ticket purchased!");
    setPicks([]); refreshProfile(); load();
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">🎰 Lottery 6/49</h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {draws.map((d) => (
            <button key={d.id} onClick={() => setActiveId(d.id)}
              className={`px-3 py-2 rounded-lg whitespace-nowrap text-xs font-bold ${
                d.id === activeId ? "bg-primary text-primary-foreground" : "bg-card border"
              }`}>
              #{d.draw_no} · {new Date(d.draw_at).toLocaleDateString()}
            </button>
          ))}
        </div>

        {active ? (
          <>
            <Card className="p-4 bg-gradient-to-br from-amber-500 to-red-600 text-white">
              <p className="text-xs opacity-80">Jackpot</p>
              <p className="text-3xl font-extrabold">TZS {Number(active.jackpot).toLocaleString()}</p>
              <p className="text-xs mt-2">Draw {new Date(active.draw_at).toLocaleString()}</p>
              <p className="text-xs">Ticket: TZS {active.ticket_price}</p>
              {active.winning_numbers && (
                <p className="mt-2 text-sm">Result: {active.winning_numbers.join(" · ")}</p>
              )}
            </Card>

            {active.status === "open" && new Date(active.draw_at) > new Date() ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Pick 6 of 49</h3>
                  <button onClick={quickPick} className="text-xs font-bold text-primary">Quick Pick</button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length:49},(_,i)=>i+1).map((n) => (
                    <button key={n} onClick={() => togglePick(n)}
                      className={`aspect-square rounded-full font-bold text-sm ${
                        picks.includes(n) ? "bg-primary text-primary-foreground" : "bg-card border"
                      }`}>{n}</button>
                  ))}
                </div>
                <Button onClick={buy} disabled={picks.length !== 6} className="w-full h-12 font-extrabold">
                  Buy Ticket ({picks.length}/6)
                </Button>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">This draw is closed.</p>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No draws scheduled.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default Lottery;
