import { Link, useNavigate } from "react-router-dom";
import { Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = ({ variant = "default" }: { variant?: "default" | "games" | "search" }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-gradient-primary text-primary-foreground shadow-elevated">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <Link to="/" className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight">
          <Crown className="w-6 h-6 text-gold fill-gold" />
          <span>Crown<span className="text-gold">Bet</span></span>
          {variant === "games" && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-primary text-xs font-bold">GAMES</span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {variant !== "search" && (
            <button
              onClick={() => navigate("/search")}
              className="p-2 rounded-full hover:bg-white/10 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-primary hover:bg-white/90 font-bold h-9"
            onClick={() => navigate("/register")}
          >
            Join Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white bg-transparent hover:bg-white hover:text-primary font-bold h-9"
            onClick={() => navigate("/login")}
          >
            Log in
          </Button>
        </div>
      </div>
    </header>
  );
};
