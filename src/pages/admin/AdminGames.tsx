import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Cat = { id: string; slug: string; name: string };
type Game = {
  id: string; slug: string; title: string; emoji: string; color: string;
  category: string; category_id: string | null; active: boolean;
  rtp: number; min_stake: number; max_stake: number; house_edge: number;
  maintenance: boolean; thumbnail_url: string | null; sort_order: number;
};

const AdminGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [form, setForm] = useState({
    slug: "", title: "", emoji: "🎮", color: "from-rose-500 to-orange-500",
    category: "Quick Games", category_id: "", rtp: 97, min_stake: 1, max_stake: 10000,
  });

  const load = async () => {
    const [{ data: g }, { data: c }] = await Promise.all([
      supabase.from("games").select("*").order("sort_order"),
      supabase.from("game_categories").select("*").order("sort_order"),
    ]);
    setGames((g ?? []) as Game[]);
    setCats((c ?? []) as Cat[]);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = cats.find((c) => c.id === form.category_id);
    const { error } = await supabase.from("games").insert([{
      ...form,
      category: cat?.name ?? form.category,
      category_id: form.category_id || null,
      sort_order: games.length + 1,
    }]);
    if (error) return toast.error(error.message);
    toast.success("Game added");
    setForm({ slug: "", title: "", emoji: "🎮", color: "from-rose-500 to-orange-500", category: "Quick Games", category_id: "", rtp: 97, min_stake: 1, max_stake: 10000 });
    load();
  };

  const update = async (id: string, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    await supabase.from("games").update(patch).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("games").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Games Library</h1>
        <p className="text-muted-foreground">Manage games, RTP, stake caps and category.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Game</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
            <Input placeholder="slug (aviator)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
            <select className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— Category —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder="RTP %" type="number" value={form.rtp} onChange={(e) => setForm({ ...form, rtp: +e.target.value })} />
            <Input placeholder="Min stake" type="number" value={form.min_stake} onChange={(e) => setForm({ ...form, min_stake: +e.target.value })} />
            <Input placeholder="Max stake" type="number" value={form.max_stake} onChange={(e) => setForm({ ...form, max_stake: +e.target.value })} />
            <Input placeholder="Color (from-x to-y)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            <Button type="submit" className="md:col-span-4">Add Game</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {games.map((g) => (
          <Card key={g.id}>
            <CardHeader className={`bg-gradient-to-br ${g.color} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{g.emoji}</span> {g.title}
                {g.maintenance && <span className="ml-auto text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">MAINT</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <label>
                  <span className="text-muted-foreground">RTP %</span>
                  <Input className="h-8" type="number" value={g.rtp} onChange={(e) => update(g.id, { rtp: +e.target.value })} />
                </label>
                <label>
                  <span className="text-muted-foreground">Min stake</span>
                  <Input className="h-8" type="number" value={g.min_stake} onChange={(e) => update(g.id, { min_stake: +e.target.value })} />
                </label>
                <label>
                  <span className="text-muted-foreground">Max stake</span>
                  <Input className="h-8" type="number" value={g.max_stake} onChange={(e) => update(g.id, { max_stake: +e.target.value })} />
                </label>
              </div>
              <Input className="h-8 text-xs" placeholder="Thumbnail URL" value={g.thumbnail_url ?? ""} onChange={(e) => update(g.id, { thumbnail_url: e.target.value })} />
              <select className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                value={g.category_id ?? ""} onChange={(e) => {
                  const cat = cats.find((c) => c.id === e.target.value);
                  update(g.id, { category_id: e.target.value || null, category: cat?.name ?? g.category });
                }}>
                <option value="">— Category —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={g.active} onChange={(e) => update(g.id, { active: e.target.checked })} /> Active
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={g.maintenance} onChange={(e) => update(g.id, { maintenance: e.target.checked })} /> Maintenance
                </label>
                <div className="flex items-center gap-2">
                  <Link to={`/games/${g.slug}`} className="text-sm font-bold text-primary hover:underline">Open →</Link>
                  <Button size="icon" variant="destructive" onClick={() => remove(g.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGames;
