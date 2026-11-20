// Pure tactical analysis + match simulation. Pitch: x 0-105 (own goal at 0), y 0-68.
export type Pt = [number, number];
export type Report = { width: number; depth: number; defLine: number; zones: { third: number; channel: number; own: number; opp: number }[]; weaknesses: string[]; attack: number; defence: number };

// Mirror opponent coordinates so they attack towards x=0.
export const mirror = (p: Pt): Pt => [105 - p[0], 68 - p[1]];

export function analyse(own: Pt[], opp: Pt[]): Report {
  const out = own.slice(1); // exclude GK (first)
  const xs = out.map((p) => p[0]), ys = out.map((p) => p[1]);
  const width = Math.max(...ys) - Math.min(...ys);
  const depth = Math.max(...xs) - Math.min(...xs);
  const defLine = Math.min(...xs);
  const zones: Report["zones"] = [];
  for (let third = 0; third < 3; third++) for (let channel = 0; channel < 3; channel++) {
    const inZ = (p: Pt) => Math.min(2, Math.floor(p[0] / 35)) === third && Math.min(2, Math.floor(p[1] / (68 / 3))) === channel;
    zones.push({ third, channel, own: own.filter(inZ).length, opp: opp.filter(inZ).length });
  }
  const weaknesses: string[] = [];
  if (width < 40) weaknesses.push("narrow");
  if (depth > 60) weaknesses.push("stretched");
  if (defLine > 35) weaknesses.push("highLine");
  zones.forEach((z) => { if (z.third === 0 && z.opp > z.own) weaknesses.push(`overload:${z.third}:${z.channel}`); });
  const attOwn = own.filter((p) => p[0] >= 70).length, attOpp = opp.filter((p) => p[0] >= 70).length;
  const midOwn = own.filter((p) => p[0] >= 35 && p[0] < 70).length, midOpp = opp.filter((p) => p[0] >= 35 && p[0] < 70).length;
  const defOwn = own.filter((p) => p[0] < 35).length, defOpp = opp.filter((p) => p[0] < 35).length;
  const attack = clamp(50 + (attOwn - defOpp) * 8 + (midOwn - midOpp) * 5 + (width - 45) * 0.4);
  const defence = clamp(50 + (defOwn - attOpp) * 8 + (midOwn - midOpp) * 5 - Math.max(0, depth - 45) * 0.6 - Math.max(0, defLine - 30) * 0.8);
  return { width, depth, defLine, zones, weaknesses, attack, defence };
}
const clamp = (v: number) => Math.round(Math.max(5, Math.min(95, v)));

// Deterministic PRNG so the same seed gives the same match.
export function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

export type Event = { minute: number; team: "home" | "away"; kind: "goal" | "chance" };
export function simulate(home: Report, away: Report, seed: number, homeRating = 70, awayRating = 70) {
  const r = rng(seed); const events: Event[] = [];
  const hStr = (home.attack - away.defence) / 100 + (homeRating - awayRating) / 200;
  const aStr = (away.attack - home.defence) / 100 + (awayRating - homeRating) / 200;
  let possH = 0;
  for (let m = 1; m <= 90; m++) {
    const h = r() < 0.5 + (home.attack + home.defence - away.attack - away.defence) / 800;
    if (h) possH++;
    if (r() < 0.14) {
      const team = h ? "home" : "away"; const str = h ? hStr : aStr;
      events.push({ minute: m, team, kind: r() < Math.max(0.05, 0.22 + str * 0.4) ? "goal" : "chance" });
    }
  }
  const score = { home: events.filter((e) => e.team === "home" && e.kind === "goal").length, away: events.filter((e) => e.team === "away" && e.kind === "goal").length };
  return { events, score, possession: Math.round((possH / 90) * 100) };
}
