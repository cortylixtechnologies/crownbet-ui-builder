import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

const cols = [
  {
    title: "Sports",
    links: [
      { l: "Football", to: "/" },
      { l: "Live Betting", to: "/live" },
      { l: "Virtuals", to: "/virtuals" },
      { l: "Jackpot", to: "/jackpot" },
      { l: "Results", to: "/results" },
    ],
  },
  {
    title: "Games",
    links: [
      { l: "Aviator", to: "/games/aviator" },
      { l: "Roulette", to: "/games/roulette" },
      { l: "Blackjack", to: "/games/blackjack" },
      { l: "Mines", to: "/games/mines" },
      { l: "Lottery", to: "/lottery" },
    ],
  },
  {
    title: "Help",
    links: [
      { l: "Promotions", to: "/promotions" },
      { l: "Load Code", to: "/load-code" },
      { l: "Livescore", to: "/livescore" },
      { l: "My Account", to: "/me" },
      { l: "A-Z Menu", to: "/menu" },
    ],
  },
];

export const SiteFooter = () => (
  <footer className="hidden lg:block bg-surface-dark text-surface-dark-foreground mt-auto">
    <div className="mx-auto max-w-[1280px] px-6 py-10 grid grid-cols-[1.4fr_repeat(3,1fr)] gap-8">
      <div>
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl">
          <Crown className="w-7 h-7 text-gold fill-gold" />
          Crown<span className="text-gold -ml-2">Bet</span>
        </Link>
        <p className="mt-3 text-sm text-surface-dark-foreground/60 max-w-xs">
          Licensed sports betting, virtuals and casino games. Play responsibly — you must be 18 years or older.
        </p>
      </div>
      {cols.map((c) => (
        <div key={c.title}>
          <h4 className="font-extrabold mb-3">{c.title}</h4>
          <ul className="space-y-2">
            {c.links.map((x) => (
              <li key={x.l}>
                <Link to={x.to} className="text-sm text-surface-dark-foreground/70 hover:text-primary transition-colors">
                  {x.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-surface-dark-muted py-4 text-center text-xs text-surface-dark-foreground/50">
      © {new Date().getFullYear()} CrownBet. 18+ only. Gambling can be addictive.
    </div>
  </footer>
);
