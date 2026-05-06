import { AppLayout } from "@/components/layout/AppLayout";
import { Award } from "lucide-react";

const results = [
  { league: "Premier League", home: "Arsenal", away: "Chelsea", score: "2 - 1", date: "Yesterday" },
  { league: "La Liga", home: "Real Madrid", away: "Sevilla", score: "3 - 0", date: "Yesterday" },
  { league: "Serie A", home: "Napoli", away: "Roma", score: "1 - 1", date: "Mon" },
  { league: "Bundesliga", home: "Leverkusen", away: "Bayern", score: "0 - 2", date: "Sun" },
  { league: "Ligue 1", home: "Lyon", away: "PSG", score: "1 - 4", date: "Sun" },
];

const Results = () => (
  <AppLayout>
    <div className="bg-surface-dark text-surface-dark-foreground px-4 py-4 flex items-center gap-2">
      <Award className="w-6 h-6 text-gold" />
      <h1 className="text-2xl font-extrabold">Results</h1>
    </div>
    <div className="bg-card divide-y divide-border">
      {results.map((r, i) => (
        <div key={i} className="px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{r.league}</span>
            <span>{r.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{r.home} vs {r.away}</span>
            <span className="text-lg font-extrabold text-foreground">{r.score}</span>
          </div>
        </div>
      ))}
    </div>
  </AppLayout>
);

export default Results;
