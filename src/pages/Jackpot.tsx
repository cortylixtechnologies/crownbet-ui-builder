import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Trophy, Crown } from "lucide-react";

const jackpots = [
  { name: "Crown Mega Jackpot", prize: "TZS 250,000,000", games: 17, entry: 1000 },
  { name: "Crown Midweek", prize: "TZS 50,000,000", games: 13, entry: 500 },
  { name: "Daily Five", prize: "TZS 5,000,000", games: 5, entry: 200 },
];

const Jackpot = () => (
  <AppLayout>
    <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 text-white px-4 py-8 text-center">
      <Trophy className="w-12 h-12 text-gold mx-auto" />
      <h1 className="text-3xl font-extrabold mt-2">Crown Jackpots</h1>
      <p className="mt-1 text-sm text-white/80">Predict every match. Win it all.</p>
    </div>
    <div className="p-3 space-y-3">
      {jackpots.map((j) => (
        <div key={j.name} className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              <h2 className="font-extrabold text-foreground">{j.name}</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-bold">{j.games} games</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-primary">{j.prize}</p>
          <p className="text-xs text-muted-foreground">Entry from TZS {j.entry.toLocaleString()}</p>
          <Link
            to="/menu"
            className="mt-3 block text-center bg-gradient-primary text-primary-foreground font-bold py-3 rounded-lg"
          >
            Play now
          </Link>
        </div>
      ))}
    </div>
  </AppLayout>
);

export default Jackpot;
