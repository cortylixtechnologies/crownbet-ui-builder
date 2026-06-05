import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; slug: string; name: string; icon: string | null; sort_order: number; active: boolean };

const AdminCategories = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ slug: "", name: "", icon: "🎮", sort_order: 10 });

  const load = async () => {
    const { data } = await supabase.from("game_categories").select("*").order("sort_order");
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) return toast.error("slug + name required");
    const { error } = await supabase.from("game_categories").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Added"); setForm({ slug: "", name: "", icon: "🎮", sort_order: 10 }); load();
  };

  const update = async (id: string, patch: Partial<Row>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("game_categories").update(patch).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("game_categories").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Game Categories</h1>
        <p className="text-muted-foreground">Organize your games library.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid md:grid-cols-5 gap-2">
            <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <Input type="number" placeholder="Sort" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="text-3xl">{r.icon}</div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input className="h-8" value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} />
                <Input className="h-8" value={r.slug} onChange={(e) => update(r.id, { slug: e.target.value })} />
                <Input className="h-8" type="number" value={r.sort_order} onChange={(e) => update(r.id, { sort_order: +e.target.value })} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={r.active} onChange={(e) => update(r.id, { active: e.target.checked })} /> Active
                </label>
              </div>
              <Button size="icon" variant="destructive" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
