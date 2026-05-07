import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminSettings = () => {
  const { store, updateSettings } = useAdmin();
  const s = store.settings;
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
            <Input value={s.siteName} onChange={(e) => updateSettings({ siteName: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold">Min Stake</span>
              <Input type="number" value={s.minStake} onChange={(e) => updateSettings({ minStake: +e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold">Max Stake</span>
              <Input type="number" value={s.maxStake} onChange={(e) => updateSettings({ maxStake: +e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold">Welcome Bonus (%)</span>
            <Input type="number" value={s.welcomeBonusPct} onChange={(e) => updateSettings({ welcomeBonusPct: +e.target.value })} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={s.acceptingBets} onChange={(e) => updateSettings({ acceptingBets: e.target.checked })} />
            <span className="text-sm">Accepting bets</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={s.maintenance} onChange={(e) => updateSettings({ maintenance: e.target.checked })} />
            <span className="text-sm">Maintenance mode</span>
          </label>
          <Button onClick={() => toast.success("Settings saved")}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
