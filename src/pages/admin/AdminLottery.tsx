import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Draw = {
  id: string; draw_no: number; ticket_price: number; jackpot: number;
  prize_pool: number; draw_at: string; status: string; winning_numbers: number[] | null;
};

const AdminLottery = () => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [form, setForm] = useState({ ticket_price: 100, jackpot: 1000000, draw_at: "" });
  const [manualNums, setManualNums] = useState<Record<string,string>>({});

  const load = async () => {
    const { data } = await supabase.from("lottery_draws").select("*").order("draw_at", { ascending: false });
    setDraws((data ?? []) as Draw[]);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.draw_at) return toast.error("Set draw time");
    const { error } = await supabase.from("lottery_draws").insert([{
      ticket_price: form.ticket_price, jackpot: form.jackpot,
      draw_at: new Date(form.draw_at).toISOString(),
    }]);
    if (error) return toast.error(error.message);
    toast.success("Draw created");
    setForm({ ticket_price: 100, jackpot: 1000000, draw_at: "" });
    load();
  };

  const settle = async (id: string) => {
    const raw = manualNums[id]?.trim();
    if (raw) {
      const nums = raw.split(/[,\s]+/).map((n) => parseInt(n)).filter((n) => n>=1 && n<=49);
      if (nums.length !== 6) return toast.error("Need 6 numbers 1-49");
      const { error } = await supabase.from("lottery_draws")
        .update({ winning_numbers: nums }).eq("id", id);
      if (error) return toast.error(error.message);
    }
    const { error } = await supabase.rpc("lottery_settle_draw", { _draw_id: id });
    if (error) return toast.error(error.message);
    toast.success("Draw settled");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Lottery Draws</h1>
        <p className="text-muted-foreground">Create draws and settle them manually or with random numbers.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Draw (6/49)</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid md:grid-cols-4 gap-3">
            <Input type="number" placeholder="Ticket price" value={form.ticket_price}
              onChange={(e)=>setForm({...form, ticket_price:+e.target.value})}/>
            <Input type="number" placeholder="Jackpot" value={form.jackpot}
              onChange={(e)=>setForm({...form, jackpot:+e.target.value})}/>
            <Input type="datetime-local" value={form.draw_at}
              onChange={(e)=>setForm({...form, draw_at:e.target.value})}/>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {draws.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="font-bold">Draw #{d.draw_no}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.draw_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  d.status === "settled" ? "bg-success/20 text-success" : "bg-amber-500/20 text-amber-600"
                }`}>{d.status}</span>
              </div>
              <p className="text-sm">Jackpot: <b>TZS {Number(d.jackpot).toLocaleString()}</b> · Pool: TZS {Number(d.prize_pool).toLocaleString()} · Ticket: {d.ticket_price}</p>
              {d.winning_numbers && <p className="text-sm">Winning: <b>{d.winning_numbers.join(", ")}</b></p>}
              {d.status !== "settled" && (
                <div className="flex flex-wrap gap-2">
                  <Input className="max-w-xs" placeholder="Optional: 6 numbers (or leave blank for random)"
                    value={manualNums[d.id] ?? ""} onChange={(e)=>setManualNums(s=>({...s,[d.id]:e.target.value}))}/>
                  <Button onClick={() => settle(d.id)}>Settle Draw</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLottery;
