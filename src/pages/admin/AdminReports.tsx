import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Tx = { id: string; user_id: string; game: string; stake: number; payout: number; net: number; created_at: string };

const AdminReports = () => {
  const [tx, setTx] = useState<Tx[]>([]);

  useEffect(() => {
    supabase.from("game_transactions").select("*").order("created_at", { ascending: false }).limit(2000)
      .then(({ data }) => setTx((data ?? []) as Tx[]));
  }, []);

  const byGame = useMemo(() => {
    const map: Record<string, { stake: number; payout: number; ggr: number; count: number }> = {};
    for (const t of tx) {
      const m = (map[t.game] ||= { stake: 0, payout: 0, ggr: 0, count: 0 });
      m.stake += Number(t.stake); m.payout += Number(t.payout);
      m.ggr += Number(t.stake) - Number(t.payout); m.count++;
    }
    return Object.entries(map).sort((a, b) => b[1].ggr - a[1].ggr);
  }, [tx]);

  const topWinners = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tx) map[t.user_id] = (map[t.user_id] ?? 0) + Number(t.net);
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [tx]);

  const exportCsv = () => {
    const rows = [["created_at","user_id","game","stake","payout","net"], ...tx.map((t) => [t.created_at, t.user_id, t.game, t.stake, t.payout, t.net])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "game_transactions.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Reports</h1>
          <p className="text-muted-foreground">GGR & player activity (last 2,000 game transactions).</p>
        </div>
        <button onClick={exportCsv} className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold">Export CSV</button>
      </div>

      <Card>
        <CardHeader><CardTitle>GGR per game</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th>Game</th><th>Rounds</th><th>Stake</th><th>Payout</th><th>GGR</th></tr></thead>
            <tbody>
              {byGame.map(([g, m]) => (
                <tr key={g} className="border-t border-border/40"><td className="capitalize">{g}</td><td>{m.count}</td><td>{m.stake.toFixed(2)}</td><td>{m.payout.toFixed(2)}</td><td className={m.ggr >= 0 ? "text-success font-bold" : "text-danger font-bold"}>{m.ggr.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top net winners</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th>User</th><th>Net</th></tr></thead>
            <tbody>
              {topWinners.map(([uid, net]) => (
                <tr key={uid} className="border-t border-border/40"><td className="font-mono text-xs">{uid.slice(0, 8)}…</td><td className={net >= 0 ? "text-success" : "text-danger"}>{net.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
