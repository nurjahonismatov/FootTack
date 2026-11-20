import type { Phase } from "./i18n";
export type Player = { id: string; number: number; name: string; position: string; captain?: boolean | undefined };
export type PhaseData = { pos: Record<string, [number, number]>; zones: Record<string, Record<string, number>> };
export type Tactic = { id: string; name: string; format: number; formation: string; updatedAt: number; players: Player[]; phases: Partial<Record<Phase, PhaseData>> };

// Formations: [position, x (0-105, own goal at 0), y (0-68)]
export const FORMATIONS: Record<string, [string, number, number][]> = {
  "4-3-3": [["GK",5,34],["LB",25,8],["LCB",20,24],["RCB",20,44],["RB",25,60],["LCM",42,20],["CDM",36,34],["RCM",42,48],["LW",68,10],["ST",75,34],["RW",68,58]],
  "4-4-2": [["GK",5,34],["LB",25,8],["LCB",20,24],["RCB",20,44],["RB",25,60],["LM",48,9],["LCM",42,26],["RCM",42,42],["RM",48,59],["ST",72,26],["ST",72,42]],
  "3-5-2": [["GK",5,34],["LCB",20,18],["CB",18,34],["RCB",20,50],["LWB",45,6],["LCM",42,24],["CDM",36,34],["RCM",42,44],["RWB",45,62],["ST",72,26],["ST",72,42]],
  "4-2-3-1": [["GK",5,34],["LB",25,8],["LCB",20,24],["RCB",20,44],["RB",25,60],["DM",38,26],["DM",38,42],["LW",60,10],["CAM",58,34],["RW",60,58],["ST",76,34]],
  "3-4-3": [["GK",5,34],["LCB",20,18],["CB",18,34],["RCB",20,50],["LM",45,8],["LCM",40,26],["RCM",40,42],["RM",45,60],["LW",68,12],["ST",75,34],["RW",68,56]],
  "5-3-2": [["GK",5,34],["LWB",28,6],["LCB",18,20],["CB",16,34],["RCB",18,48],["RWB",28,62],["LCM",42,22],["CM",40,34],["RCM",42,46],["ST",70,26],["ST",70,42]],
};
const KEY = "fts-tactics";
export const loadAll = (): Tactic[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export const saveAll = (t: Tactic[]) => localStorage.setItem(KEY, JSON.stringify(t));
export const upsert = (t: Tactic) => { const all = loadAll().filter((x) => x.id !== t.id); saveAll([{ ...t, updatedAt: Date.now() }, ...all]); };
export const uid = () => Math.random().toString(36).slice(2, 10);

export function shiftForPhase(base: [number, number], phase: Phase): [number, number] {
  const dx = phase === "attacking" || phase === "attTrans" ? 10 : phase === "defensive" || phase === "defTrans" ? -10 : 0;
  return [Math.max(1, Math.min(104, base[0] + (base[0] < 10 ? 0 : dx))), base[1]];
}
export function newTactic(formation = "4-3-3"): Tactic {
  const f = FORMATIONS[formation] ?? FORMATIONS["4-3-3"]!;
  const players: Player[] = f.map(([p], i) => ({ id: uid(), number: i + 1, name: "", position: p, captain: i === 3 }));
  const pos: Record<string, [number, number]> = {};
  players.forEach((pl, i) => (pos[pl.id] = [f[i]![1], f[i]![2]]));
  return { id: uid(), name: "", format: 11, formation, updatedAt: Date.now(), players, phases: { balanced: { pos, zones: {} } } };
}
export function getPhase(t: Tactic, phase: Phase): PhaseData {
  if (t.phases[phase]) return t.phases[phase]!;
  const base = t.phases.balanced!;
  const pos: Record<string, [number, number]> = {};
  for (const id in base.pos) pos[id] = shiftForPhase(base.pos[id]!, phase);
  return { pos, zones: {} };
}
