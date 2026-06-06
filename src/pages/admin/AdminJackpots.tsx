import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type JP = { id: string; name: string; prize: number; entry_fee: number; deadline: string; status: string };
type Match = { id: string; home: string; away: string; league: string; approved: boolean };
type JPM = { id: string; jackpot_id: string; match_id: string; result: string | null };

const AdminJackpots = () => {
  const [jps, setJps] = useState<JP[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [jpms, setJpms] = useState<JPM[]>([]);
  const [form, setForm] = useState({ name: "", prize: 10000000, entry_fee: 500, deadline: "" });
  const [selectedJp, setSelectedJp] = useState<string | null>(null);

  const load = async () => {
    const [{ data: j }, { data: m }, { data: jm }] = await Promise.all([
      supabase.from("jackpots").select("*").order("created_at", { ascending: false }),
      supabase.from("matches").select("id,home,away,league,approved").eq("approved", true).limit(200),
      supabase.from("jackpot_matches").select("*"),
    ]);
    setJps((j ?? []) as JP[]);
    setMatches((m ?? []) as Match[]);
    setJpms((jm ?? []) as JPM[]);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deadline) return toast.error("Deadline required");
    const { error } = await supabase.from("jackpots").insert([{
      ...form, deadline: new Date(form.deadline).toISOString(),
    }]);
    if (error) return toast.error(error.message);
    toast.success("Jackpot created");
    setForm({ name: "", prize: 10000000, entry_fee: 500, deadline: "" });
    load();
  };

  const addMatch = async (jpId: string, matchId: string) => {
    const { error } = await supabase.from("jackpot_matches").insert([{ jackpot_id: jpId, match_id: matchId }]);
    if (error) return toast.error(error.message);
    load();
  };
  const removeMatch = async (id: string) => {
    await supabase.from("jackpot_matches").delete().eq("id", id); load();
  };
  const setResult = async (id: string, result: string) => {
    await supabase.from("jackpot_matches").update({ result }).eq("id", id); load();
  };

  const settle = async (id: string) => {
    const { data, error } = await supabase.rpc("jackpot_settle", { _jp_id: id });
    if (error) return toast.error(error.message);
    const r: any = Array.isArray(data) ? data[0] : data;
    toast.success(`Settled — ${r.winners} winners, ${r.total_paid} paid`);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Jackpot Pools</h1>
        <p className="text-muted-foreground">Build jackpots, assign matches, set results and settle.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Jackpot</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid md:grid-cols-5 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
            <Input type="number" placeholder="Prize" value={form.prize} onChange={(e)=>setForm({...form, prize:+e.target.value})}/>
            <Input type="number" placeholder="Entry fee" value={form.entry_fee} onChange={(e)=>setForm({...form, entry_fee:+e.target.value})}/>
            <Input type="datetime-local" value={form.deadline} onChange={(e)=>setForm({...form, deadline:e.target.value})}/>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {jps.map((j) => {
          const linked = jpms.filter((x) => x.jackpot_id === j.id);
          return (
            <Card key={j.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{j.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Prize TZS {Number(j.prize).toLocaleString()} · Entry {j.entry_fee} · Deadline {new Date(j.deadline).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    j.status === "settled" ? "bg-success/20 text-success" : "bg-amber-500/20 text-amber-600"
                  }`}>{j.status}</span>
                </div>

                <div className="space-y-1">
                  {linked.map((lm) => {
                    const m = matches.find((x) => x.id === lm.match_id);
                    return (
                      <div key={lm.id} className="flex items-center gap-2 text-sm border rounded p-2">
                        <span className="flex-1">{m ? `${m.home} vs ${m.away}` : lm.match_id}</span>
                        {(["1","X","2"] as const).map((r) => (
                          <button key={r} onClick={() => setResult(lm.id, r)}
                            className={`px-2 py-1 text-xs rounded ${lm.result === r ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{r}</button>
                        ))}
                        <Button size="icon" variant="ghost" onClick={() => removeMatch(lm.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {j.status !== "settled" && (
                  <div className="flex flex-wrap gap-2">
                    <select className="h-10 rounded-md border bg-background px-3 text-sm flex-1 min-w-[200px]"
                      value={selectedJp === j.id ? "" : ""} onChange={(e) => { if (e.target.value) addMatch(j.id, e.target.value); }}>
                      <option value="">+ Add approved match…</option>
                      {matches.filter((m) => !linked.some((l) => l.match_id === m.id)).map((m) => (
                        <option key={m.id} value={m.id}>{m.league} · {m.home} vs {m.away}</option>
                      ))}
                    </select>
                    <Button onClick={() => settle(j.id)} variant="default">Settle Now</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminJackpots;
