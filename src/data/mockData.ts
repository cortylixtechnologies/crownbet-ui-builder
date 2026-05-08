// Shared types + static catalog data (matches/promos now come from the database)

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

// Map a database `matches` row into the Match shape used by UI components
export const mapDbMatch = (r: any): Match => ({
  id: r.id,
  league: r.league,
  leagueIcon: r.league_icon ?? undefined,
  home: r.home,
  away: r.away,
  date: r.match_date,
  time: r.match_time,
  odds: { home: Number(r.odds_home), draw: Number(r.odds_draw), away: Number(r.odds_away) },
  live: r.live,
  score: r.score ?? undefined,
  minute: r.minute ?? undefined,
  hot: r.hot,
});
