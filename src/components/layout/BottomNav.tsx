import { NavLink, useLocation } from "react-router-dom";
import { Home, Menu, Gamepad2, Receipt, User } from "lucide-react";
import { useBetslip } from "@/context/BetslipContext";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "AZ Menu", icon: Menu },
  { to: "/games", label: "Games", icon: Gamepad2, accent: true },
  { to: "/open-bets", label: "Open Bets", icon: Receipt },
  { to: "/me", label: "Me", icon: User },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const { selections } = useBetslip();

  return (
    <>
      {/* Floating betslip pill */}
      {selections.length > 0 && pathname !== "/betslip" && (
        <NavLink
          to="/betslip"
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-success text-success-foreground shadow-elevated flex items-center justify-center"
        >
          <Receipt className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-white text-success text-xs font-bold flex items-center justify-center">
            {selections.length}
          </span>
        </NavLink>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-dark text-surface-dark-foreground border-t border-surface-dark-muted">
        <div className="grid grid-cols-5">
          {items.map(({ to, label, icon: Icon, accent }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 gap-1 text-[11px] font-medium transition-colors relative ${
                  isActive ? "text-primary" : "text-white/70 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      accent
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white"
                        : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{label}</span>
                  {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="h-safe-bottom" />
      </nav>
    </>
  );
};
