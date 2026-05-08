import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Settings = {
  site_name: string;
  maintenance: boolean;
  accepting_bets: boolean;
  min_stake: number;
  max_stake: number;
  welcome_bonus_pct: number;
};

const AdminSettings = () => {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
      .then(({ data }) => setS(data as Settings));
  }, []);

  if (!s) return null;

  const save = async () => {
    const { error } = await supabase.from("site_settings").update(s).eq("id", 1);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold">Site Settings</h1>
        <p className="text-muted-foreground">Global configuration for Crownbet</p>
      </div>
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold">Site Name</span>
            <Input value={s.site_name} onChange={(e) => setS({ ...s, site_name: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold">Min Stake</span>
              <Input type="number" value={s.min_stake} onChange={(e) => setS({ ...s, min_stake: +e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold">Max Stake</span>
              <Input type="number" value={s.max_stake} onChange={(e) => setS({ ...s, max_stake: +e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold">Welcome Bonus (%)</span>
            <Input type="number" value={s.welcome_bonus_pct} onChange={(e) => setS({ ...s, welcome_bonus_pct: +e.target.value })} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={s.accepting_bets} onChange={(e) => setS({ ...s, accepting_bets: e.target.checked })} />
            <span className="text-sm">Accepting bets</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={s.maintenance} onChange={(e) => setS({ ...s, maintenance: e.target.checked })} />
            <span className="text-sm">Maintenance mode</span>
          </label>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
