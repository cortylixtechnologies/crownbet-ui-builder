import { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Radio,
  Megaphone,
  Users,
  Settings,
  LogOut,
  Crown,
  Gamepad2,
  ExternalLink,
  Trophy,
  Tag,
  BarChart3,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_BASE, ADMIN_LOGIN } from "@/config/adminPath";

const items = [
  { to: ADMIN_BASE, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: `${ADMIN_BASE}/matches`, label: "Matches", icon: CalendarRange },
  { to: `${ADMIN_BASE}/sports`, label: "Sports/Leagues", icon: Trophy },
  { to: `${ADMIN_BASE}/live`, label: "Live Control", icon: Radio },
  { to: `${ADMIN_BASE}/promotions`, label: "Promotions", icon: Megaphone },
  { to: `${ADMIN_BASE}/games`, label: "Games", icon: Gamepad2 },
  { to: `${ADMIN_BASE}/categories`, label: "Categories", icon: Tag },
  { to: `${ADMIN_BASE}/reports`, label: "Reports", icon: BarChart3 },
  { to: `${ADMIN_BASE}/risk`, label: "Risk Controls", icon: ShieldAlert },
  { to: `${ADMIN_BASE}/audit`, label: "Audit Log", icon: ClipboardList },
  { to: `${ADMIN_BASE}/users`, label: "Users", icon: Users },
  { to: `${ADMIN_BASE}/settings`, label: "Settings", icon: Settings },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (!isAdmin) return <Navigate to={ADMIN_LOGIN} replace />;

  return (
    <div className="min-h-screen flex bg-secondary text-foreground">
      <aside className="w-60 bg-surface-dark text-surface-dark-foreground flex flex-col sticky top-0 h-screen">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <Crown className="w-5 h-5 text-gold fill-gold" />
            Crown<span className="text-gold">Bet</span>
          </div>
          <p className="text-[11px] text-white/60 mt-0.5">Control Panel</p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-white/10 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" /> View Site
          </NavLink>
          <button
            onClick={async () => {
              await signOut();
              navigate(ADMIN_LOGIN);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-6 max-w-6xl mx-auto">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
};
