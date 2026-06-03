import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Radio, Users, Megaphone, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_BASE } from "@/config/adminPath";

const Stat = ({ label, value, icon: Icon, accent }: any) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ matches: 0, live: 0, users: 0, promos: 0, balance: 0, bets: 0 });
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [m, mLive, u, p, b] = await Promise.all([
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*").eq("live", true),
        supabase.from("profiles").select("balance"),
        supabase.from("promotions").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("bets").select("*", { count: "exact", head: true }).gte("placed_at", new Date(Date.now() - 86400000).toISOString()),
      ]);
      setStats({
        matches: m.count ?? 0,
        live: mLive.data?.length ?? 0,
        users: u.data?.length ?? 0,
        promos: p.count ?? 0,
        balance: u.data?.reduce((a: number, x: any) => a + Number(x.balance), 0) ?? 0,
        bets: b.count ?? 0,
      });
      setLiveMatches(mLive.data ?? []);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your betting platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Total Matches" value={stats.matches} icon={CalendarRange} accent="bg-primary" />
        <Stat label="Live Now" value={stats.live} icon={Radio} accent="bg-success" />
        <Stat label="Users" value={stats.users} icon={Users} accent="bg-accent" />
        <Stat label="Promotions" value={stats.promos} icon={Megaphone} accent="bg-gold text-gold-foreground" />
        <Stat label="Total Balances" value={`$${stats.balance.toLocaleString()}`} icon={DollarSign} accent="bg-primary-dark" />
        <Stat label="Bets (24h)" value={stats.bets} icon={TrendingUp} accent="bg-surface-dark" />
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: `${ADMIN_BASE}/matches`, label: "Add Match" },
            { to: `${ADMIN_BASE}/live`, label: "Manage Live" },
            { to: `${ADMIN_BASE}/promotions`, label: "New Promo" },
            { to: `${ADMIN_BASE}/settings`, label: "Site Settings" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-lg border border-border bg-card p-4 text-sm font-bold hover:bg-secondary hover:-translate-y-0.5 transition"
            >
              {a.label} →
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Live Matches</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {liveMatches.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-secondary rounded-lg p-3 text-sm">
              <div>
                <div className="font-bold">{m.home} vs {m.away}</div>
                <div className="text-xs text-muted-foreground">{m.league}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-success">{m.score}</div>
                <div className="text-xs text-muted-foreground">{m.minute}</div>
              </div>
            </div>
          ))}
          {liveMatches.length === 0 && <p className="text-sm text-muted-foreground">No live matches right now.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
