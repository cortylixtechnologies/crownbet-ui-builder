import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Sel = { id: string; match_label: string; market: string; pick: string; odd: number };
type Bet = {
  id: string; user_id: string; stake: number; total_odds: number; potential_win: number;
  status: string; placed_at: string; settled_at: string | null; bet_selections: Sel[];
};

export const statusClass = (s: string) =>
  s === "won" ? "text-success" : s === "lost" ? "text-danger" : s === "pending" ? "text-gold" : "text-muted-foreground";

export const BetRow = ({ bet, userLabel, onSettled }: { bet: Bet; userLabel?: string; onSettled: () => void }) => {
  const [open, setOpen] = useState(false);
  const settle = async (result: "won" | "lost" | "void") => {
    if (!confirm(`Mark this bet as ${result.toUpperCase()}?`)) return;
    const { data, error } = await supabase.rpc("admin_settle_bet", { _bet_id: bet.id, _result: result });
    if (error) return toast.error(error.message);
    toast.success(`Bet ${result}. Credited TSh ${Number(data ?? 0).toLocaleString()}`);
    onSettled();
  };
  return (
    <div className="bg-secondary rounded-lg p-3 text-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <button onClick={() => setOpen((o) => !o)} className="text-left">
          {userLabel && <div className="font-bold">{userLabel}</div>}
          <div className="text-xs text-muted-foreground">
            {new Date(bet.placed_at).toLocaleString()} · {bet.bet_selections?.length ?? 0} selection(s) {open ? "▲" : "▼"}
          </div>
        </button>
        <div className="flex items-center gap-4">
          <div>Stake <b>{Number(bet.stake).toLocaleString()}</b></div>
          <div>Odds <b>{Number(bet.total_odds).toFixed(2)}</b></div>
          <div>Win <b>{Number(bet.potential_win).toLocaleString()}</b></div>
          <div className={`font-bold uppercase ${statusClass(bet.status)}`}>{bet.status}</div>
          {bet.status === "pending" && (
            <div className="flex gap-1">
              <Button size="sm" className="h-7 bg-success hover:bg-success/90" onClick={() => settle("won")}>Won</Button>
              <Button size="sm" variant="destructive" className="h-7" onClick={() => settle("lost")}>Lost</Button>
              <Button size="sm" variant="outline" className="h-7" onClick={() => settle("void")}>Void</Button>
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-2 space-y-1 border-t border-border pt-2">
          {bet.bet_selections?.map((s) => (
            <div key={s.id} className="flex justify-between text-xs">
              <span>{s.match_label} — {s.market}: <b>{s.pick}</b></span>
              <span>@{Number(s.odd).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const load = async () => {
    const [b, p] = await Promise.all([
      supabase.from("bets").select("*, bet_selections(*)").order("placed_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("id, display_name, email, phone"),
    ]);
    setBets((b.data ?? []) as any);
    const map: Record<string, string> = {};
    (p.data ?? []).forEach((u: any) => (map[u.id] = u.display_name || u.phone || u.email || u.id.slice(0, 8)));
    setUsers(map);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => bets.filter((b) =>
    (status === "all" || b.status === status) &&
    (!q || (users[b.user_id] ?? "").toLowerCase().includes(q.toLowerCase()) ||
      b.bet_selections?.some((s) => s.match_label.toLowerCase().includes(q.toLowerCase())))
  ), [bets, status, q, users]);

  const totals = useMemo(() => {
    const stake = bets.reduce((a, b) => a + Number(b.stake), 0);
    const paid = bets.filter((b) => b.status === "won").reduce((a, b) => a + Number(b.potential_win), 0);
    const exposure = bets.filter((b) => b.status === "pending").reduce((a, b) => a + Number(b.potential_win), 0);
    return { stake, paid, exposure, pending: bets.filter((b) => b.status === "pending").length };
  }, [bets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Bets</h1>
        <p className="text-muted-foreground">Every sports bet placed by players — view details and settle.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["Total staked", totals.stake], ["Paid out", totals.paid], ["Pending bets", totals.pending], ["Open exposure", totals.exposure]].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-4"><div className="text-xl font-extrabold">{Number(v).toLocaleString()}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex-row flex-wrap gap-2 items-center justify-between">
          <CardTitle>Bets ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search user or match" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              {["all", "pending", "won", "lost", "void", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((b) => <BetRow key={b.id} bet={b} userLabel={users[b.user_id]} onSettled={load} />)}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No bets found.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBets;
