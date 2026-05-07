import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Radio, Users, Megaphone, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

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
  const { store } = useAdmin();
  const liveCount = store.matches.filter((m) => m.live).length;
  const activeUsers = store.users.filter((u) => u.status === "active").length;
  const totalBalance = store.users.reduce((a, u) => a + u.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your betting platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Total Matches" value={store.matches.length} icon={CalendarRange} accent="bg-primary" />
        <Stat label="Live Now" value={liveCount} icon={Radio} accent="bg-success" />
        <Stat label="Active Users" value={activeUsers} icon={Users} accent="bg-accent" />
        <Stat label="Promotions" value={store.promos.filter((p) => p.active).length} icon={Megaphone} accent="bg-gold text-gold-foreground" />
        <Stat label="Total Balances" value={`$${totalBalance.toLocaleString()}`} icon={DollarSign} accent="bg-primary-dark" />
        <Stat label="Bets (24h)" value={Math.floor(Math.random() * 200) + 50} icon={TrendingUp} accent="bg-surface-dark" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: "/admin/matches", label: "Add Match" },
            { to: "/admin/live", label: "Manage Live" },
            { to: "/admin/promotions", label: "New Promo" },
            { to: "/admin/settings", label: "Site Settings" },
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
        <CardHeader>
          <CardTitle>Recent Live Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {store.matches.filter((m) => m.live).slice(0, 5).map((m) => (
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
          {liveCount === 0 && <p className="text-sm text-muted-foreground">No live matches right now.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
