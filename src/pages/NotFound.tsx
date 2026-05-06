import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Crown, Home, Activity, Receipt, Gamepad2, Menu as MenuIcon } from "lucide-react";

const suggestions = [
  { to: "/", label: "Home", icon: Home },
  { to: "/live", label: "Live", icon: Activity },
  { to: "/menu", label: "A-Z Menu", icon: MenuIcon },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/betslip", label: "Betslip", icon: Receipt },
];

const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.warn(`[CrownBet] 404 — no route matches "${pathname}"`);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-gradient-dark text-white flex flex-col items-center justify-center px-6 py-12 text-center">
      <Crown className="w-16 h-16 text-gold mb-4" />
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2 text-white/70 max-w-sm">
        The page <code className="text-gold font-mono">{pathname}</code> doesn't exist on CrownBet.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-gradient-primary rounded-lg font-bold shadow-elevated"
      >
        Back to Home
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <p className="text-xs uppercase tracking-wider text-white/50 font-bold mb-3">Try one of these</p>
        <div className="grid grid-cols-5 gap-2">
          {suggestions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <Icon className="w-5 h-5 text-gold" />
              <span className="text-[11px] font-bold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default NotFound;
