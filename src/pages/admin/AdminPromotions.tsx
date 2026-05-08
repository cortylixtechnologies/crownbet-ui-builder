import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const colorPresets = [
  "from-amber-500 to-red-600",
  "from-purple-500 to-pink-500",
  "from-blue-700 to-indigo-900",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-orange-500",
];

const AdminPromotions = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", emoji: "🎁", color: colorPresets[0], to_url: "/promotions" });

  const load = async () => {
    const { data } = await supabase.from("promotions").select("*").order("sort_order");
    setPromos(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Title required");
    const { error } = await supabase.from("promotions").insert([{ ...form, active: true, sort_order: promos.length + 1 }]);
    if (error) return toast.error(error.message);
    setForm({ title: "", emoji: "🎁", color: colorPresets[0], to_url: "/promotions" });
    toast.success("Promo added");
    load();
  };

  const update = async (id: string, patch: any) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase.from("promotions").update(patch).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("promotions").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Promotions</h1>
        <p className="text-muted-foreground">Manage banners and offers</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Promo</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
              {colorPresets.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input placeholder="Link (/promotions)" value={form.to_url} onChange={(e) => setForm({ ...form, to_url: e.target.value })} />
            <Button type="submit" className="md:col-span-4">Add Promo</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        {promos.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-3 space-y-2">
              <div className={`relative h-24 rounded-lg bg-gradient-to-br ${p.color} flex items-end p-2`}>
                <div className="absolute top-1 right-2 text-3xl">{p.emoji}</div>
                <span className="text-white text-xs font-bold drop-shadow">{p.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={p.active}
                    onChange={(e) => update(p.id, { active: e.target.checked })} />
                  Active
                </label>
                <Button size="icon" variant="destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
