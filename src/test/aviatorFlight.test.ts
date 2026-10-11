import { describe, expect, it } from "vitest";
import { flightPosition } from "@/lib/aviatorFlight";

describe("Aviator flight presentation", () => {
  it("takes off from the bottom-left corner", () => {
    expect(flightPosition(1)).toEqual({ x: 24, y: 438 });
  });
  it("moves right and upward along a rising curve", () => {
    const first = flightPosition(1.5);
    const later = flightPosition(3.77);
    expect(later.x).toBeGreaterThan(first.x);
    expect(later.y).toBeLessThan(first.y);
    expect(later.x).toBeLessThan(900);
    expect(later.y).toBeGreaterThan(0);
  });
});