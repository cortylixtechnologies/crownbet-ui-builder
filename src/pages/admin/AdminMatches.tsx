import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Radio } from "lucide-react";
import { toast } from "sonner";

const empty = {
  league: "",
  home: "",
  away: "",
  date: "Today",
  time: "20:00",
  oddHome: 2.0,
  oddDraw: 3.2,
  oddAway: 3.5,
  live: false,
  hot: false,
};

const AdminMatches = () => {
  const { store, addMatch, updateMatch, deleteMatch, toggleLive } = useAdmin();
  const [form, setForm] = useState(empty);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.league || !form.home || !form.away) {
      toast.error("League, home and away are required");
      return;
    }
    addMatch({
      league: form.league,
      home: form.home,
      away: form.away,
      date: form.date,
      time: form.time,
      odds: { home: Number(form.oddHome), draw: Number(form.oddDraw), away: Number(form.oddAway) },
      live: form.live,
      hot: form.hot,
    });
    toast.success("Match added");
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Matches</h1>
        <p className="text-muted-foreground">Add and manage matches and odds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Match</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
            <Input placeholder="League (e.g. Premier League)" value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} />
            <Input placeholder="Home Team" value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} />
            <Input placeholder="Away Team" value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} />
            <Input placeholder="Date (Today/Tomorrow/Sat)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input placeholder="Time (20:00)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" step="0.01" placeholder="1" value={form.oddHome} onChange={(e) => setForm({ ...form, oddHome: +e.target.value })} />
              <Input type="number" step="0.01" placeholder="X" value={form.oddDraw} onChange={(e) => setForm({ ...form, oddDraw: +e.target.value })} />
              <Input type="number" step="0.01" placeholder="2" value={form.oddAway} onChange={(e) => setForm({ ...form, oddAway: +e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.live} onChange={(e) => setForm({ ...form, live: e.target.checked })} />
              Live now
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hot} onChange={(e) => setForm({ ...form, hot: e.target.checked })} />
              Hot match 🔥
            </label>
            <Button type="submit" className="md:col-span-3 bg-primary">Add Match</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Matches ({store.matches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {store.matches.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_auto] gap-3 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="text-xs text-muted-foreground">{m.league} · {m.date} {m.time}</div>
                <div className="font-bold">{m.home} vs {m.away}</div>
                <div className="flex gap-2 mt-2">
                  <Input
                    className="h-8 w-20 text-xs"
                    type="number" step="0.01"
                    value={m.odds.home}
                    onChange={(e) => updateMatch(m.id, { odds: { ...m.odds, home: +e.target.value } })}
                  />
                  <Input
                    className="h-8 w-20 text-xs"
                    type="number" step="0.01"
                    value={m.odds.draw}
                    onChange={(e) => updateMatch(m.id, { odds: { ...m.odds, draw: +e.target.value } })}
                  />
                  <Input
                    className="h-8 w-20 text-xs"
                    type="number" step="0.01"
                    value={m.odds.away}
                    onChange={(e) => updateMatch(m.id, { odds: { ...m.odds, away: +e.target.value } })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={m.live ? "default" : "outline"}
                  onClick={() => toggleLive(m.id)}
                  className={m.live ? "bg-success hover:bg-success/90" : ""}
                >
                  <Radio className="w-3.5 h-3.5 mr-1" /> {m.live ? "Live" : "Set Live"}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => { deleteMatch(m.id); toast.success("Deleted"); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMatches;
