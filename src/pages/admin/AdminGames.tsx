import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminGames = () => {
  const [games, setGames] = useState<any[]>([]);
  const [form, setForm] = useState({ slug: "", title: "", emoji: "🎮", color: "from-rose-500 to-orange-500", category: "Quick Games" });

  const load = async () => {
    const { data } = await supabase.from("games").select("*").order("sort_order");
    setGames(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("games").insert([{ ...form, sort_order: games.length + 1 }]);
    if (error) return toast.error(error.message);
    setForm({ slug: "", title: "", emoji: "🎮", color: "from-rose-500 to-orange-500", category: "Quick Games" });
    toast.success("Game added");
    load();
  };

  const update = async (id: string, patch: any) => {
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
        <p className="text-muted-foreground">Manage virtual games on the platform</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Game</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-5 gap-3">
            <Input placeholder="slug (aviator)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Color (from-x to-y)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            <Button type="submit" className="md:col-span-5">Add Game</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        {games.map((g) => (
          <Card key={g.id}>
            <CardHeader className={`bg-gradient-to-br ${g.color} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{g.emoji}</span> {g.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground">Category: {g.category}</div>
              <div className="text-xs text-muted-foreground">Slug: {g.slug}</div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={g.active} onChange={(e) => update(g.id, { active: e.target.checked })} />
                  Active
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
