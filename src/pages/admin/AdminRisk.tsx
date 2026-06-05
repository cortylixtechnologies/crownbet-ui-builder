import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Risk = { id: number; global_max_win: number; daily_user_loss_cap: number; max_active_bets_per_user: number };

const AdminRisk = () => {
  const [r, setR] = useState<Risk | null>(null);

  useEffect(() => {
    supabase.from("risk_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setR(data as Risk));
  }, []);

  const save = async () => {
    if (!r) return;
    const { error } = await supabase.from("risk_settings").update({
      global_max_win: r.global_max_win,
      daily_user_loss_cap: r.daily_user_loss_cap,
      max_active_bets_per_user: r.max_active_bets_per_user,
    }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  if (!r) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Risk Controls</h1>
        <p className="text-muted-foreground">Site-wide limits applied to bets and games.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Limits</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <label className="text-sm">
            <span className="text-muted-foreground">Global max win per ticket</span>
            <Input type="number" value={r.global_max_win} onChange={(e) => setR({ ...r, global_max_win: +e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Daily loss cap per user</span>
            <Input type="number" value={r.daily_user_loss_cap} onChange={(e) => setR({ ...r, daily_user_loss_cap: +e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Max active bets / user</span>
            <Input type="number" value={r.max_active_bets_per_user} onChange={(e) => setR({ ...r, max_active_bets_per_user: +e.target.value })} />
          </label>
          <div className="md:col-span-3">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRisk;
