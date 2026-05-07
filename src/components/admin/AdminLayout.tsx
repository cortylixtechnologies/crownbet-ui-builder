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
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/matches", label: "Matches", icon: CalendarRange },
  { to: "/admin/live", label: "Live Control", icon: Radio },
  { to: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { to: "/admin/games", label: "Games", icon: Gamepad2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-secondary text-foreground">
      <aside className="w-60 bg-surface-dark text-surface-dark-foreground flex flex-col sticky top-0 h-screen">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <Crown className="w-5 h-5 text-gold fill-gold" />
            Crown<span className="text-gold">Bet</span>
          </div>
          <p className="text-[11px] text-white/60 mt-0.5">Admin Panel</p>
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
            onClick={() => {
              logout();
              navigate("/admin/login");
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
