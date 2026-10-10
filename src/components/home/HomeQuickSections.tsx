import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Dices, Ticket, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/context/AuthGateContext";

const sections = [
  { title: "Casino", detail: "Roulette, blackjack & table games", to: "/games", playTo: "/games/roulette", action: "Play roulette", icon: Dices, accent: "text-primary", message: "Sign up or log in to play casino games." },
  { title: "Lottery", detail: "Pick your numbers for the next draw", to: "/lottery", playTo: "/lottery", action: "Get a ticket", icon: Ticket, accent: "text-success", message: "Sign up or log in to enter the lottery." },
  { title: "Jackpot", detail: "Predict results for the big prize", to: "/jackpot", playTo: "/jackpot", action: "Enter jackpot", icon: Trophy, accent: "text-primary", message: "Sign up or log in to enter a jackpot." },
];

export const HomeQuickSections = () => {
  const { requireAuth } = useAuthGate();
  const navigate = useNavigate();

  return (
    <section aria-label="Casino, Lottery and Jackpot" className="mx-auto max-w-[1280px] px-3 lg:px-6 py-4 lg:py-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {sections.map(({ title, detail, to, playTo, action, icon: Icon, accent, message }) => (
          <div key={title} className="bg-card border border-border rounded-sm p-2 sm:p-4 flex flex-col justify-between gap-2 hover:border-success/50 transition-colors">
            <Link to={to} className="group flex items-start justify-between gap-2 min-w-0 hover:text-primary transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                <span className="shrink-0 w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center"><Icon className={`w-5 h-5 ${accent}`} /></span>
                <span className="min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold text-foreground group-hover:text-success">{title}</span>
                  <span className="hidden sm:block text-xs text-muted-foreground leading-snug">{detail}</span>
                </span>
              </div>
              <ArrowUpRight className="w-3 h-3 shrink-0 text-muted-foreground group-hover:text-success" />
            </Link>
            <Button variant="link" size="sm" className="self-start h-auto px-0 py-1 text-[10px] sm:text-xs text-success" onClick={() => requireAuth(() => navigate(playTo), message)}>{action}</Button>
          </div>
        ))}
      </div>
    </section>
  );
};