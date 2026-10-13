import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BetRow } from "./AdminBets";

const UserDetail = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const [tab, setTab] = useState<"bets" | "games" | "deposits">("bets");
  const [bets, setBets] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [deps, setDeps] = useState<any[]>([]);

  const load = async () => {
    const [b, g, d] = await Promise.all([
      supabase.from("bets").select("*, bet_selections(*)").eq("user_id", user.id).order("placed_at", { ascending: false }),
      supabase.from("game_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200),
      supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setBets(b.data ?? []); setGames(g.data ?? []); setDeps(d.data ?? []);
  };
  useEffect(() => { load(); }, [user.id]);

  const stats = useMemo(() => ({
    staked: bets.reduce((a, b) => a + Number(b.stake), 0),
    won: bets.filter((b) => b.status === "won").reduce((a, b) => a + Number(b.potential_win), 0),
    gameNet: games.reduce((a, g) => a + Number(g.net), 0),
    deposited: deps.filter((d) => d.status === "completed").reduce((a, d) => a + Number(d.amount), 0),
  }), [bets, games, deps]);

  return (
    <Card className="border-primary">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{user.display_name ?? user.email}</CardTitle>
          <p className="text-xs text-muted-foreground">{user.email} {user.phone && `· ${user.phone}`} · joined {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {[["Balance", user.balance], ["Deposited", stats.deposited], ["Bets staked", stats.staked], ["Bets won", stats.won], ["Games net", stats.gameNet]].map(([l, v]) => (
            <div key={l as string} className="bg-secondary rounded-lg p-3"><div className="font-extrabold">{Number(v).toLocaleString()}</div><div className="text-xs text-muted-foreground">{l}</div></div>
          ))}
        </div>
        <div className="flex gap-2">
          {(["bets", "games", "deposits"] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="capitalize">
              {t} ({t === "bets" ? bets.length : t === "games" ? games.length : deps.length})
            </Button>
          ))}
        </div>
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {tab === "bets" && bets.map((b) => <BetRow key={b.id} bet={b} onSettled={load} />)}
          {tab === "games" && games.map((g) => (
            <div key={g.id} className="flex justify-between bg-secondary rounded-lg p-2 text-sm">
              <span className="capitalize">{g.game} · {new Date(g.created_at).toLocaleString()}</span>
              <span>Stake {Number(g.stake)} · Payout {Number(g.payout)} · <b className={Number(g.net) >= 0 ? "text-success" : "text-danger"}>{Number(g.net)}</b></span>
            </div>
          ))}
          {tab === "deposits" && deps.map((d) => (
            <div key={d.id} className="flex justify-between bg-secondary rounded-lg p-2 text-sm">
              <span>{d.phone} · {new Date(d.created_at).toLocaleString()}</span>
              <span>TSh {Number(d.amount).toLocaleString()} · <b className={d.status === "completed" ? "text-success" : "text-muted-foreground"}>{d.status}</b></span>
            </div>
          ))}
          {((tab === "bets" && !bets.length) || (tab === "games" && !games.length) || (tab === "deposits" && !deps.length)) &&
            <p className="text-sm text-muted-foreground">Nothing yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  const filtered = users.filter((u) =>
    !q || [u.display_name, u.email, u.phone].some((v) => (v ?? "").toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Users</h1>
        <p className="text-muted-foreground">Manage players, balances, and view their bets, games and deposits</p>
      </div>
      {selected && <UserDetail user={selected} onClose={() => setSelected(null)} />}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>All Users ({filtered.length})</CardTitle>
          <Input placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-64" />
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center bg-secondary rounded-lg p-3">
              <div>
                <div className="font-bold text-sm">{u.display_name ?? u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email} {u.phone && `· ${u.phone}`}</div>
              </div>
              <Input className="h-9 w-32" type="number" step="0.01" value={u.balance}
                onChange={(e) => update(u.id, { balance: +e.target.value })} />
              <Button size="sm"
                variant={u.status === "active" ? "default" : "destructive"}
                onClick={() => update(u.id, { status: u.status === "active" ? "suspended" : "active" })}
                className={u.status === "active" ? "bg-success hover:bg-success/90" : ""}>
                {u.status === "active" ? "Active" : "Suspended"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setSelected(u); window.scrollTo({ top: 0, behavior: "smooth" }); }}>View activity</Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
