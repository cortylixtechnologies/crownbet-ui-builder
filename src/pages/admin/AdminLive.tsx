import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLive = () => {
  const [matches, setMatches] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("matches").select("*").order("live", { ascending: false });
    setMatches(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const { error } = await supabase.from("matches").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success animate-pulse" /> Live Control
        </h1>
        <p className="text-muted-foreground">Toggle live state, scores and minutes in real time</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Matches</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {matches.map((m) => (
            <div key={m.id} className="grid md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="text-xs text-muted-foreground">{m.league}</div>
                <div className="font-bold text-sm">{m.home} vs {m.away}</div>
              </div>
              <Input className="h-9 w-28" placeholder="Score 1 - 0" value={m.score ?? ""}
                onChange={(e) => update(m.id, { score: e.target.value })} />
              <Input className="h-9 w-20" placeholder="45'" value={m.minute ?? ""}
                onChange={(e) => update(m.id, { minute: e.target.value })} />
              <Button size="sm" onClick={() => update(m.id, { live: !m.live })}
                className={m.live ? "bg-success hover:bg-success/90" : "bg-muted text-foreground hover:bg-muted/80"}>
                <Radio className="w-3.5 h-3.5 mr-1" /> {m.live ? "LIVE" : "Off"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLive;
