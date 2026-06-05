import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  sport: string;
  league_name: string;
  league_external_id: string | null;
  active: boolean;
  default_margin: number;
  sort_order: number;
};

const SPORTS = [
  "soccer","basketball","tennis","ice hockey","american football",
  "baseball","rugby","cricket","motorsport","esports","fighting",
];

const empty = { sport: "soccer", league_name: "", league_external_id: "", active: true, default_margin: 0.08, sort_order: 0 };

const AdminSports = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("sports_config").select("*").order("sport").order("sort_order");
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.league_name) return toast.error("League name required");
    const { error } = await supabase.from("sports_config").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Added"); setForm(empty); load();
  };

  const update = async (id: string, patch: Partial<Row>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("sports_config").update(patch).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("sports_config").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Sports & Leagues</h1>
        <p className="text-muted-foreground">Pick which sports & leagues the auto-importer pulls.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add league</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid md:grid-cols-5 gap-2">
            <select className="h-10 rounded-md border bg-background px-3 text-sm capitalize"
              value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="League name" value={form.league_name} onChange={(e) => setForm({ ...form, league_name: e.target.value })} />
            <Input placeholder="TheSportsDB ID (optional)" value={form.league_external_id} onChange={(e) => setForm({ ...form, league_external_id: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Margin" value={form.default_margin} onChange={(e) => setForm({ ...form, default_margin: +e.target.value })} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{rows.length} configured</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[120px_1fr_120px_100px_auto_auto] gap-2 items-center bg-secondary rounded-lg p-2">
              <span className="text-xs font-bold uppercase">{r.sport}</span>
              <Input className="h-8" value={r.league_name} onChange={(e) => update(r.id, { league_name: e.target.value })} />
              <Input className="h-8" value={r.league_external_id ?? ""} placeholder="ID" onChange={(e) => update(r.id, { league_external_id: e.target.value })} />
              <Input className="h-8" type="number" step="0.01" value={r.default_margin} onChange={(e) => update(r.id, { default_margin: +e.target.value })} />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={r.active} onChange={(e) => update(r.id, { active: e.target.checked })} /> Active
              </label>
              <Button size="icon" variant="destructive" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSports;
