export type Match = {
  id: string;
  league: string;
  leagueIcon?: string;
  home: string;
  away: string;
  date: string;
  time: string;
  odds: { home: number; draw: number; away: number };
  live?: boolean;
  score?: string;
  minute?: string;
  hot?: boolean;
};

export const featuredMatches: Match[] = [
  { id: "m1", league: "UEFA Champions League", home: "Arsenal", away: "Atletico Madrid", date: "Today", time: "21:00", odds: { home: 1.04, draw: 9.50, away: 15.00 }, live: true, score: "1 - 0", minute: "90'", hot: true },
  { id: "m2", league: "Premier League", home: "Man City", away: "Liverpool", date: "Tomorrow", time: "17:30", odds: { home: 2.10, draw: 3.40, away: 3.20 }, hot: true },
  { id: "m3", league: "La Liga", home: "Real Madrid", away: "Barcelona", date: "Sat", time: "20:00", odds: { home: 1.85, draw: 3.60, away: 4.10 } },
  { id: "m4", league: "Serie A", home: "Inter", away: "Juventus", date: "Sun", time: "19:45", odds: { home: 1.95, draw: 3.30, away: 3.80 } },
  { id: "m5", league: "Bundesliga", home: "Bayern", away: "Dortmund", date: "Sat", time: "18:30", odds: { home: 1.55, draw: 4.20, away: 5.50 } },
  { id: "m6", league: "Ligue 1", home: "PSG", away: "Marseille", date: "Sun", time: "20:00", odds: { home: 1.40, draw: 4.50, away: 7.00 } },
];

export const liveMatches: Match[] = [
  { id: "l1", league: "UEFA Champions League", home: "Arsenal", away: "Atletico Madrid", date: "Live", time: "90'", odds: { home: 1.04, draw: 9.50, away: 15.00 }, live: true, score: "1 - 0", minute: "90+2'", hot: true },
  { id: "l2", league: "Copa Libertadores", home: "Flamengo", away: "Boca Juniors", date: "Live", time: "67'", odds: { home: 2.20, draw: 3.10, away: 3.40 }, live: true, score: "1 - 1", minute: "67'" },
  { id: "l3", league: "MLS", home: "Inter Miami", away: "LA Galaxy", date: "Live", time: "34'", odds: { home: 1.75, draw: 3.80, away: 4.20 }, live: true, score: "2 - 0", minute: "34'", hot: true },
  { id: "l4", league: "J-League", home: "Kashima", away: "Urawa Reds", date: "Live", time: "12'", odds: { home: 2.50, draw: 3.20, away: 2.80 }, live: true, score: "0 - 0", minute: "12'" },
];

export const promoCards = [
  { id: "p1", title: "Lucky Numbers", color: "from-purple-500 to-pink-500", emoji: "🎱", to: "/games" },
  { id: "p2", title: "JACKPOT", color: "from-amber-500 to-red-600", emoji: "🏆", to: "/jackpot" },
  { id: "p3", title: "Champions League", color: "from-blue-700 to-indigo-900", emoji: "⚽", to: "/league/champions-league" },
  { id: "p4", title: "Crown Missions", color: "from-emerald-500 to-teal-700", emoji: "👑", to: "/promotions" },
  { id: "p5", title: "Aviator", color: "from-rose-500 to-orange-500", emoji: "✈️", to: "/games" },
];

export type SportLeagues = { name: string; count: number; leagues: string[] };

export const sportsCatalog: SportLeagues[] = [
  { name: "Popular", count: 245, leagues: ["Today's Football", "Football In Next 3 Hours", "Champions League", "Europa League", "Conference League", "CONMEBOL LIB / SUD", "England Premier League", "Spain La Liga", "Italy Serie A", "Bundesliga", "France Ligue 1"] },
  { name: "Football", count: 180, leagues: ["England Premier League", "Spain La Liga", "Italy Serie A", "Bundesliga", "France Ligue 1", "Eredivisie", "Primeira Liga", "MLS", "Saudi Pro League"] },
  { name: "vFootball", count: 32, leagues: ["vPremier", "vLa Liga", "vBundesliga", "vSerie A"] },
  { name: "Basketball", count: 48, leagues: ["NBA", "EuroLeague", "NCAA", "Spain ACB", "Italy LBA", "Germany BBL"] },
  { name: "Tennis", count: 56, leagues: ["ATP", "WTA", "ATP Challenger", "ITF Men", "ITF Women", "Davis Cup"] },
  { name: "eFootball", count: 24, leagues: ["eFootball Cup", "eChampions", "eWorld Cup"] },
  { name: "Table Tennis", count: 18, leagues: ["TT Star League", "TT Cup", "Setka Cup"] },
  { name: "Ice Hockey", count: 22, leagues: ["NHL", "KHL", "SHL", "Liiga"] },
  { name: "Handball", count: 14, leagues: ["EHF Champions League", "Bundesliga Handball", "LIQUI MOLY"] },
  { name: "Volleyball", count: 12, leagues: ["CEV Champions League", "Italy SuperLega", "PlusLiga"] },
  { name: "Cricket", count: 9, leagues: ["IPL", "Big Bash", "T20 Blast", "ICC World Cup"] },
];

export const sportsList = sportsCatalog.map(({ name, count }) => ({ name, count }));
export const popularLeagues = sportsCatalog[0].leagues;

export const games = {
  Popular: [
    { id: "g1", title: "Crown Wars", color: "from-amber-500 via-red-600 to-rose-700", emoji: "👑" },
    { id: "g2", title: "Flip Da Coin", color: "from-yellow-500 to-amber-700", emoji: "🪙" },
    { id: "g3", title: "Spin Match", color: "from-fuchsia-500 to-purple-700", emoji: "🎡" },
    { id: "g4", title: "Lucky Wheel", color: "from-cyan-500 to-blue-700", emoji: "🎰" },
  ],
  "Crash Games": [
    { id: "g5", title: "Crown Run", color: "from-orange-500 to-red-700", emoji: "🏃" },
    { id: "g6", title: "Rugby Blitz", color: "from-emerald-500 to-green-800", emoji: "🏉" },
    { id: "g7", title: "Galaxy Go", color: "from-indigo-500 to-purple-900", emoji: "🛸" },
  ],
  "Quick Games": [
    { id: "g8", title: "Flip Da Coin", color: "from-yellow-500 to-amber-700", emoji: "🪙" },
    { id: "g9", title: "Mines", color: "from-orange-600 to-red-900", emoji: "💣" },
    { id: "g10", title: "Piggy Bash", color: "from-pink-500 to-rose-700", emoji: "🐷" },
  ],
  "Slot Games": [
    { id: "g11", title: "Hot Slots", color: "from-red-500 to-orange-700", emoji: "🔥" },
    { id: "g12", title: "Aztec Gold", color: "from-emerald-600 to-yellow-700", emoji: "🗿" },
    { id: "g13", title: "Sweet Bonanza", color: "from-pink-400 to-purple-600", emoji: "🍭" },
  ],
};

export const recommendedCodes = [
  {
    code: "5HNXKE",
    plays: 20,
    folds: 2,
    odds: 102.0,
    bets: [
      { market: "Correct Score", pick: "1:2", odd: 8.5, home: "Sporting Cristal", away: "SE Palmeiras", date: "06/05 Wed 01:00" },
      { market: "Correct Score", pick: "3:1", odd: 12.0, home: "CA Rosario C", away: "Libertad Asu", date: "06/05 Wed 01:00" },
    ],
  },
  {
    code: "6AF1KG",
    plays: 8,
    folds: 27,
    odds: 1990.26,
    bets: [
      { market: "Double Chance", pick: "Home or Away", odd: 1.32, home: "Independiente", away: "Caracas FC", date: "06/05 Wed 01:00" },
      { market: "Double Chance", pick: "Home or Away", odd: 1.21, home: "CD Recoleta", away: "Santos FC SP", date: "06/05 Wed 03:30" },
      { market: "Double Chance", pick: "Home or Away", odd: 1.30, home: "Academia P", away: "CS Cienciano", date: "06/05 Wed 03:30" },
    ],
  },
];

export const slugify = (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
