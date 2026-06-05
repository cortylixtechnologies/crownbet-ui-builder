import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Radio, Check, Download, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type DbMatch = {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  match_date: string;
  match_time: string;
  odds_home: number;
  odds_draw: number;
  odds_away: number;
  live: boolean;
  hot: boolean;
  score: string | null;
  minute: string | null;
  approved: boolean;
  source: string;
};

const empty = {
  sport: "soccer",
  league: "",
  home: "",
  away: "",
  match_date: "Today",
  match_time: "20:00",
  odds_home: 2.0,
  odds_draw: 3.2,
  odds_away: 3.5,
  live: false,
  hot: false,
  approved: true,
  source: "manual",
};

const SPORTS = ["soccer","basketball","tennis","ice hockey","american football","baseball","rugby","cricket","motorsport","esports"];

const AdminMatches = () => {
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [form, setForm] = useState(empty);
  const [tab, setTab] = useState<"pending" | "published" | "all">("pending");
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState("");
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const [sportFilter, setSportFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    setMatches((data ?? []) as DbMatch[]);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.league || !form.home || !form.away) {
      toast.error("League, home and away are required");
      return;
    }
    const { error } = await supabase.from("matches").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Match added");
    setForm(empty);
    load();
  };

  const update = async (id: string, patch: Partial<DbMatch>) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const { error } = await supabase.from("matches").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const runImport = async () => {
    setImporting(true);
    const { data, error } = await supabase.functions.invoke("import-fixtures");
    setImporting(false);
    if (error) return toast.error(error.message);
    toast.success(
      `Imported ${data?.imported ?? 0}, updated ${data?.updated ?? 0} (scanned ${data?.fetched ?? 0} events)`
    );
    load();
  };

  const approveAllFiltered = async (rows: DbMatch[]) => {
    const ids = rows.filter((m) => !m.approved).map((m) => m.id);
    if (!ids.length) return toast.info("Nothing to approve");
    const { error } = await supabase.from("matches").update({ approved: true }).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`Approved ${ids.length} fixtures`);
    load();
  };

  const leagues = useMemo(
    () => Array.from(new Set(matches.map((m) => m.league))).sort(),
    [matches]
  );
  const sources = useMemo(
    () => Array.from(new Set(matches.map((m) => m.source))).sort(),
    [matches]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches.filter((m) => {
      if (tab === "pending" && m.approved) return false;
      if (tab === "published" && !m.approved) return false;
      if (sportFilter !== "all" && (m.sport ?? "soccer") !== sportFilter) return false;
      if (leagueFilter !== "all" && m.league !== leagueFilter) return false;
      if (sourceFilter !== "all" && m.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        m.home.toLowerCase().includes(q) ||
        m.away.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q) ||
        m.match_date.toLowerCase().includes(q)
      );
    });
  }, [matches, tab, query, sportFilter, leagueFilter, sourceFilter]);

  const pendingCount = matches.filter((m) => !m.approved).length;
  const publishedCount = matches.filter((m) => m.approved).length;

  const clearFilters = () => {
    setQuery("");
    setSportFilter("all");
    setLeagueFilter("all");
    setSourceFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold">Matches</h1>
          <p className="text-muted-foreground">Auto-imported fixtures land in <b>Pending</b>. Approve to publish.</p>
        </div>
        <Button onClick={runImport} disabled={importing} className="bg-primary">
          {importing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Import fixtures now
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Match Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="League" value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} />
            <Input placeholder="Home Team" value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} />
            <Input placeholder="Away Team" value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} />
            <Input placeholder="Date" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} />
            <Input placeholder="Time" value={form.match_time} onChange={(e) => setForm({ ...form, match_time: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" step="0.01" value={form.odds_home} onChange={(e) => setForm({ ...form, odds_home: +e.target.value })} />
              <Input type="number" step="0.01" value={form.odds_draw} onChange={(e) => setForm({ ...form, odds_draw: +e.target.value })} />
              <Input type="number" step="0.01" value={form.odds_away} onChange={(e) => setForm({ ...form, odds_away: +e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.live} onChange={(e) => setForm({ ...form, live: e.target.checked })} /> Live now
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hot} onChange={(e) => setForm({ ...form, hot: e.target.checked })} /> Hot 🔥
            </label>
            <Button type="submit" className="md:col-span-3 bg-primary">Add Match (published)</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button variant={tab === "pending" ? "default" : "outline"} size="sm" onClick={() => setTab("pending")}>
              Pending ({pendingCount})
            </Button>
            <Button variant={tab === "published" ? "default" : "outline"} size="sm" onClick={() => setTab("published")}>
              Published ({publishedCount})
            </Button>
            <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>
              All ({matches.length})
            </Button>
          </div>
          <div className="grid md:grid-cols-[1fr_160px_200px_180px_auto] gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team, league, date…"
                className="pl-9"
              />
            </div>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
            >
              <option value="all">All sports</option>
              {SPORTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All leagues</option>
              {leagues.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All sources</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              {(query || leagueFilter !== "all" || sourceFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              )}
              {tab !== "published" && filtered.some((m) => !m.approved) && (
                <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approveAllFiltered(filtered)}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve all ({filtered.filter((m) => !m.approved).length})
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {matches.length}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No matches. Try clearing filters or click "Import fixtures now".
            </p>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_auto] gap-3 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-accent/30 text-foreground text-[10px] font-bold uppercase">{m.sport ?? "soccer"}</span>
                  {m.league} · {m.match_date} {m.match_time}
                  {m.source !== "manual" && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">{m.source}</span>
                  )}
                </div>
                <div className="font-bold">{m.home} vs {m.away}</div>
                <div className="flex gap-2 mt-2 items-center">
                  <span className="text-[10px] text-muted-foreground w-8">1</span>
                  <Input className="h-8 w-20 text-xs" type="number" step="0.01" value={m.odds_home}
                    onChange={(e) => update(m.id, { odds_home: +e.target.value })} />
                  <span className="text-[10px] text-muted-foreground w-8">X</span>
                  <Input className="h-8 w-20 text-xs" type="number" step="0.01" value={m.odds_draw}
                    onChange={(e) => update(m.id, { odds_draw: +e.target.value })} />
                  <span className="text-[10px] text-muted-foreground w-8">2</span>
                  <Input className="h-8 w-20 text-xs" type="number" step="0.01" value={m.odds_away}
                    onChange={(e) => update(m.id, { odds_away: +e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!m.approved ? (
                  <Button size="sm" onClick={() => update(m.id, { approved: true })} className="bg-success hover:bg-success/90">
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                ) : (
                  <Button size="sm" variant={m.live ? "default" : "outline"}
                    onClick={() => update(m.id, { live: !m.live })}
                    className={m.live ? "bg-success hover:bg-success/90" : ""}>
                    <Radio className="w-3.5 h-3.5 mr-1" /> {m.live ? "Live" : "Set Live"}
                  </Button>
                )}
                <Button size="icon" variant="destructive" onClick={() => remove(m.id)}>
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
