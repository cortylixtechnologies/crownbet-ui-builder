import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Coins, Dice5, Bomb, Disc3 } from "lucide-react";

const games = [
  { to: "/games/aviator", title: "Aviator", desc: "Cash out before the plane flies away", icon: Plane, color: "from-rose-500 to-orange-500" },
  { to: "/games/coin-flip", title: "Coin Flip", desc: "Heads or tails — double or nothing", icon: Coins, color: "from-yellow-500 to-amber-700" },
  { to: "/games/dice", title: "Dice Roll", desc: "Predict roll over/under", icon: Dice5, color: "from-fuchsia-500 to-purple-700" },
  { to: "/games/mines", title: "Mines", desc: "Reveal gems, dodge mines", icon: Bomb, color: "from-orange-600 to-red-900" },
  { to: "/games/wheel", title: "Lucky Wheel", desc: "Spin to win up to 50x", icon: Disc3, color: "from-cyan-500 to-blue-700" },
];

const AdminGames = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-extrabold">Games Library</h1>
      <p className="text-muted-foreground">Active virtual games on the platform</p>
    </div>
    <div className="grid md:grid-cols-3 gap-3">
      {games.map((g) => (
        <Card key={g.to}>
          <CardHeader className={`bg-gradient-to-br ${g.color} text-white rounded-t-lg`}>
            <CardTitle className="flex items-center gap-2"><g.icon className="w-5 h-5" /> {g.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">{g.desc}</p>
            <Link to={g.to} className="text-sm font-bold text-primary hover:underline">Open game →</Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminGames;
