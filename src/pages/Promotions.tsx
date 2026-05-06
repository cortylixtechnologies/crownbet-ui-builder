import { AppLayout } from "@/components/layout/AppLayout";
import { Gift } from "lucide-react";

const promos = [
  { title: "100% Welcome Bonus", desc: "Up to TZS 100,000 on your first deposit", color: "from-primary to-primary-dark" },
  { title: "Acca Boost", desc: "Up to 170% extra on winning multibets", color: "from-emerald-500 to-emerald-800" },
  { title: "Cashback Monday", desc: "10% cashback on weekend losses", color: "from-amber-500 to-orange-700" },
  { title: "Free Spins Friday", desc: "50 free spins every Friday", color: "from-fuchsia-500 to-purple-800" },
];

const Promotions = () => (
  <AppLayout>
    <div className="bg-gradient-primary text-primary-foreground px-4 py-5 flex items-center gap-2">
      <Gift className="w-6 h-6 text-gold" />
      <h1 className="text-2xl font-extrabold">Promotions</h1>
    </div>
    <div className="p-3 space-y-3">
      {promos.map((p) => (
        <div key={p.title} className={`rounded-xl bg-gradient-to-br ${p.color} text-white p-5 shadow-card`}>
          <h2 className="text-lg font-extrabold">{p.title}</h2>
          <p className="text-sm text-white/90 mt-1">{p.desc}</p>
          <button className="mt-3 bg-white text-foreground font-bold text-sm px-4 py-2 rounded-lg">
            Claim now
          </button>
        </div>
      ))}
    </div>
  </AppLayout>
);

export default Promotions;
