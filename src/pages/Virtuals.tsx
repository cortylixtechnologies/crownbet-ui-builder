import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Grid3x3, Plane, Coins, Dice5, Bomb, Disc3 } from "lucide-react";

const playable = [
  { name: "Aviator", to: "/games/aviator", emoji: "✈️", icon: Plane, color: "from-rose-500 to-orange-500" },
  { name: "Coin Flip", to: "/games/coin-flip", emoji: "🪙", icon: Coins, color: "from-yellow-500 to-amber-700" },
  { name: "Dice Roll", to: "/games/dice", emoji: "🎲", icon: Dice5, color: "from-fuchsia-500 to-purple-700" },
  { name: "Mines", to: "/games/mines", emoji: "💣", icon: Bomb, color: "from-orange-600 to-red-900" },
  { name: "Lucky Wheel", to: "/games/wheel", emoji: "🎡", icon: Disc3, color: "from-cyan-500 to-blue-700" },
  { name: "vFootball", to: "/league/vfootball", emoji: "⚽", icon: Grid3x3, color: "from-emerald-600 to-green-800" },
];

const Virtuals = () => (
  <AppLayout>
    <div className="bg-surface-dark text-surface-dark-foreground px-4 py-5">
      <div className="flex items-center gap-2">
        <Grid3x3 className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-extrabold">Virtuals & Instant Games</h1>
      </div>
      <p className="text-white/70 text-sm mt-1">Play, win and cash out 24/7</p>
    </div>
    <div className="p-3 grid grid-cols-2 gap-3">
      {playable.map((v) => (
        <Link
          key={v.name}
          to={v.to}
          className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${v.color} text-white font-bold flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-elevated hover:-translate-y-0.5 active:scale-95 transition`}
        >
          <span className="text-4xl">{v.emoji}</span>
          <span className="text-sm text-center px-2 leading-tight">{v.name}</span>
        </Link>
      ))}
    </div>
  </AppLayout>
);

export default Virtuals;
