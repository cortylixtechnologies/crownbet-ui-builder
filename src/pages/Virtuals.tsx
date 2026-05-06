import { AppLayout } from "@/components/layout/AppLayout";
import { Grid3x3 } from "lucide-react";
import { toast } from "sonner";

const virtuals = [
  { name: "vFootball League", emoji: "⚽", color: "from-emerald-600 to-green-800" },
  { name: "vBasketball", emoji: "🏀", color: "from-orange-500 to-red-700" },
  { name: "vHorse Racing", emoji: "🐎", color: "from-amber-600 to-yellow-800" },
  { name: "vGreyhounds", emoji: "🐕", color: "from-slate-600 to-slate-900" },
  { name: "vTennis", emoji: "🎾", color: "from-lime-500 to-emerald-700" },
  { name: "vCricket", emoji: "🏏", color: "from-blue-600 to-indigo-800" },
];

const Virtuals = () => (
  <AppLayout>
    <div className="bg-surface-dark text-surface-dark-foreground px-4 py-5">
      <div className="flex items-center gap-2">
        <Grid3x3 className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-extrabold">Virtuals</h1>
      </div>
      <p className="text-white/70 text-sm mt-1">Action every 3 minutes — 24/7</p>
    </div>
    <div className="p-3 grid grid-cols-2 gap-3">
      {virtuals.map((v) => (
        <button
          key={v.name}
          onClick={() => toast.info(`${v.name} starting soon…`)}
          className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${v.color} text-white font-bold flex flex-col items-center justify-center gap-2 shadow-card active:scale-95 transition`}
        >
          <span className="text-4xl">{v.emoji}</span>
          <span className="text-sm text-center px-2 leading-tight">{v.name}</span>
        </button>
      ))}
    </div>
  </AppLayout>
);

export default Virtuals;
