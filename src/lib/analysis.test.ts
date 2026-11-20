import { describe, expect, it } from "vitest";
import { analyse, simulate, mirror } from "./analysis";
import { FORMATIONS } from "./tactics";
const pts = (f: string) => FORMATIONS[f]!.map(([, x, y]) => [x, y] as [number, number]);
describe("analysis", () => {
  it("mirror flips opponent onto other half", () => { expect(mirror([5, 34])).toEqual([100, 34]); });
  it("flags a high defensive line beyond 35m", () => {
    const own = pts("4-3-3").map(([x, y], i) => (i === 0 ? [x, y] : [x + 30, y]) as [number, number]);
    expect(analyse(own, pts("4-4-2").map(mirror)).weaknesses).toContain("highLine");
  });
  it("same seed gives same match", () => {
    const a = analyse(pts("4-3-3"), pts("4-4-2").map(mirror)), b = analyse(pts("4-4-2"), pts("4-3-3").map(mirror));
    expect(simulate(a, b, 42)).toEqual(simulate(a, b, 42));
  });
});
