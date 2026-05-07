import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

const AdminLive = () => {
  const { store, updateMatch, toggleLive } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success animate-pulse" /> Live Control
        </h1>
        <p className="text-muted-foreground">Toggle live state, scores and minutes in real time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {store.matches.map((m) => (
            <div key={m.id} className="grid md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="text-xs text-muted-foreground">{m.league}</div>
                <div className="font-bold text-sm">{m.home} vs {m.away}</div>
              </div>
              <Input
                className="h-9 w-28"
                placeholder="Score 1 - 0"
                value={m.score ?? ""}
                onChange={(e) => updateMatch(m.id, { score: e.target.value })}
              />
              <Input
                className="h-9 w-20"
                placeholder="45'"
                value={m.minute ?? ""}
                onChange={(e) => updateMatch(m.id, { minute: e.target.value })}
              />
              <Button
                size="sm"
                onClick={() => toggleLive(m.id)}
                className={m.live ? "bg-success hover:bg-success/90" : "bg-muted text-foreground hover:bg-muted/80"}
              >
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
