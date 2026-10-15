export type CatalogGame = { slug: string; title: string; category: string; playable: boolean; badge?: string };

// Only implemented games may accept wagers; provider titles are catalog previews.
export const gameCatalog: CatalogGame[] = [
  { slug: "aviator", title: "Aviator", category: "Crash", playable: true, badge: "Popular" },
  { slug: "crown-hero", title: "Crown Hero", category: "Quick", playable: false },
  { slug: "spin-da-bottle", title: "Spin Da Bottle", category: "Wheel", playable: false },
  { slug: "the-special-one", title: "The Special One", category: "Quick", playable: false, badge: "New" },
  { slug: "beats-hearts", title: "Beats & Hearts", category: "Slots", playable: false },
  { slug: "spin-match", title: "Spin Match", category: "Wheel", playable: false },
  { slug: "galaxy-go", title: "Galaxy Go", category: "Crash", playable: false },
  { slug: "red-black", title: "Red & Black", category: "Card Games", playable: false },
  { slug: "coin-flip", title: "Flip Da Coin", category: "Quick", playable: true, badge: "Popular" },
  { slug: "rush", title: "Rush", category: "Crash", playable: false },
  { slug: "even-odd", title: "Even Odd", category: "Dice", playable: false },
  { slug: "aero", title: "Aero", category: "Crash", playable: false },
  { slug: "ping-pong", title: "Ping Pong", category: "Quick", playable: false },
  { slug: "crash-x", title: "Crash X", category: "Crash", playable: false },
  { slug: "hot-to-burn", title: "Hot To Burn", category: "Slots", playable: false },
  { slug: "high-flyer", title: "High Flyer", category: "Crash", playable: false },
  { slug: "wheel", title: "Spin Win", category: "Wheel", playable: true, badge: "Popular" },
  { slug: "astro-x", title: "Astro X", category: "Crash", playable: false, badge: "New" },
  { slug: "mines", title: "Mines", category: "Numbers", playable: true },
  { slug: "crown-kick", title: "Crown Kick", category: "Quick", playable: false },
  { slug: "roulette", title: "Roulette", category: "Wheel", playable: true },
  { slug: "blackjack", title: "Blackjack", category: "Card Games", playable: true },
  { slug: "sic-bo", title: "Sic Bo", category: "Dice", playable: true },
  { slug: "dice", title: "Dice", category: "Dice", playable: true },
];

export const filterCatalog = (games: CatalogGame[], category: string, query: string) => games.filter((game) => {
  const categoryMatch = category === "All Games" || (category === "Popular" ? game.badge === "Popular" : category === "New" ? game.badge === "New" : category === "Playable" ? game.playable : game.category === category);
  return categoryMatch && game.title.toLowerCase().includes(query.trim().toLowerCase());
});