import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Crown, ChevronDown, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const mainNav = [
  { label: "Sports", to: "/" },
  { label: "Games", to: "/games" },
  { label: "Live Betting", to: "/live" },
  { label: "Scheduled Virtuals", to: "/virtuals" },
  { label: "Jackpot", to: "/jackpot" },
  { label: "Livescore", to: "/livescore" },
  { label: "Results", to: "/results" },
  { label: "Promotions", to: "/promotions" },
  { label: "Lottery", to: "/lottery" },
];

const sportsNav = [
  { label: "Home", to: "/" },
  { label: "Football", to: "/league/football" },
  { label: "vFootball", to: "/virtuals" },
  { label: "Basketball", to: "/league/basketball" },
  { label: "Tennis", to: "/league/tennis" },
  { label: "eFootball", to: "/league/efootball" },
  { label: "Table Tennis", to: "/league/table-tennis" },
  { label: "Ice Hockey", to: "/league/ice-hockey" },
];

export const Header = ({ variant = "default" }: { variant?: "default" | "games" | "search" }) => {
  const navigate = useNavigate();
  const { session, profile, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const quickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await signIn(email, password);
    setBusy(false);
    if (r.error) return toast.error(r.error);
    toast.success("Logged in");
  };

  return (
    <header className="sticky top-0 z-40 shadow-elevated">
      {/* ---------- Mobile bar ---------- */}
      <div className="lg:hidden bg-gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <Link to="/" className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight">
            <Crown className="w-6 h-6 text-gold fill-gold" />
            <span>Crown<span className="text-gold">Bet</span></span>
            {variant === "games" && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-card text-primary text-xs font-bold">GAMES</span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {variant !== "search" && (
              <button onClick={() => navigate("/search")} className="p-2 rounded-full hover:bg-primary-foreground/10 transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
            {session ? (
              <Link to="/me" className="flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-3 h-9 text-sm font-bold">
                <Wallet className="w-4 h-4" />
                {Number(profile?.balance ?? 0).toLocaleString()}
              </Link>
            ) : (
              <>
                <Button variant="secondary" size="sm" className="bg-card text-primary hover:bg-card/90 font-bold h-9" onClick={() => navigate("/register")}>
                  Join Now
                </Button>
                <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-card hover:text-primary font-bold h-9" onClick={() => navigate("/login")}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Desktop bar ---------- */}
      <div className="hidden lg:block bg-gradient-primary text-primary-foreground">
        <div className="mx-auto max-w-[1280px] px-6 pt-3">
          <div className="flex items-start justify-between gap-6">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-3xl tracking-tight">
              <Crown className="w-8 h-8 text-gold fill-gold" />
              <span>Crown<span className="text-gold">Bet</span></span>
              <span className="ml-2 flex items-center gap-1 text-sm font-semibold opacity-90">
                🇹🇿 Tanzania <ChevronDown className="w-4 h-4" />
              </span>
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <Link to="/me" className="flex items-center gap-2 bg-primary-foreground/15 rounded-md px-4 h-10 font-bold hover:bg-primary-foreground/25 transition">
                  <Wallet className="w-4 h-4" />
                  TZS {Number(profile?.balance ?? 0).toLocaleString()}
                </Link>
                <Button variant="secondary" className="bg-card text-primary hover:bg-card/90 font-bold h-10" onClick={() => navigate("/open-bets")}>
                  My Bets
                </Button>
                <button onClick={() => signOut()} className="p-2 rounded hover:bg-primary-foreground/15 transition" aria-label="Log out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-right">
                <form onSubmit={quickLogin} className="flex items-center gap-2">
                  <Input
                    value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                    placeholder="Email address"
                    className="w-56 h-10 bg-card text-foreground border-0 rounded-md"
                  />
                  <Input
                    value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
                    placeholder="Password"
                    className="w-44 h-10 bg-card text-foreground border-0 rounded-md"
                  />
                  <Button type="submit" disabled={busy} variant="secondary" className="h-10 px-6 bg-surface-dark text-surface-dark-foreground hover:bg-surface-dark-muted font-bold">
                    {busy ? "…" : "Login"}
                  </Button>
                  <Button type="button" onClick={() => navigate("/register")} className="h-10 px-6 bg-card text-primary hover:bg-card/90 font-bold border border-primary-foreground/40">
                    Register
                  </Button>
                </form>
                <div className="mt-1.5 flex items-center justify-end gap-4 text-xs font-semibold">
                  <span className="opacity-80">Keep me signed in</span>
                  <Link to="/login" className="hover:underline">Forgot Password?</Link>
                  <Link to="/register" className="text-gold hover:underline">Create free account</Link>
                </div>
              </div>
            )}
          </div>

          {/* main nav */}
          <nav className="mt-2 flex items-end gap-1">
            {mainNav.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-[15px] font-bold rounded-t-md transition-colors ${
                    isActive ? "bg-card text-primary" : "text-primary-foreground/90 hover:bg-primary-foreground/10"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <button onClick={() => navigate("/search")} className="ml-auto mb-1 p-2 rounded-full hover:bg-primary-foreground/10 transition" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>

      {/* sports sub nav (desktop) */}
      <div className="hidden lg:block bg-card border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {sportsNav.map((s, i) => (
            <NavLink
              key={s.label}
              to={s.to}
              end={s.to === "/"}
              className={({ isActive }) =>
                `py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  isActive && i === 0
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
          <Link to="/menu" className="py-3 text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
            More Sports <ChevronDown className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
