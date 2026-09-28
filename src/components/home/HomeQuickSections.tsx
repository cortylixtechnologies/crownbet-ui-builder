import { Link } from "react-router-dom";
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

  return (
    <section aria-label="Casino, Lottery and Jackpot" className="mx-auto max-w-[1280px] px-3 lg:px-6 py-4 lg:py-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sections.map(({ title, detail, to, playTo, action, icon: Icon, accent, message }) => (
          <div key={title} className="bg-card border border-border rounded-md p-4 flex flex-col justify-between gap-4 hover:border-primary/50 transition-colors">
            <Link to={to} className="group flex items-start justify-between gap-2 min-w-0 hover:text-primary transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-10 h-10 bg-secondary rounded-md flex items-center justify-center"><Icon className={`w-5 h-5 ${accent}`} /></span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold text-foreground group-hover:text-primary">{title}</span>
                  <span className="block text-xs text-muted-foreground leading-snug">{detail}</span>
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Button size="sm" className="self-start font-bold" onClick={() => requireAuth(() => window.location.assign(playTo), message)}>{action}</Button>
          </div>
        ))}
      </div>
    </section>
  );
};