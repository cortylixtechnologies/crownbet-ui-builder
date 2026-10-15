import { describe, expect, it } from "vitest";
import { filterCatalog, gameCatalog } from "@/data/gameCatalog";

describe("sports and instant games remain separate", () => {
  it("keeps football and NFL fixtures outside Games", () => {
    expect(gameCatalog.some((game) => ["football", "nfl", "tennis", "basketball", "vfootball"].includes(game.slug))).toBe(false);
  });
  it("only offers the eight implemented games for wagering", () => {
    expect(filterCatalog(gameCatalog, "Playable", "").map((game) => game.slug).sort()).toEqual(["aviator", "blackjack", "coin-flip", "dice", "mines", "roulette", "sic-bo", "wheel"]);
  });
});