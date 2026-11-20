// Generic localStorage collections for teams, set pieces, drills and match plans.
export const uid = () => Math.random().toString(36).slice(2, 10);
export function collection<T extends { id: string }>(key: string) {
  const load = (): T[] => { if (typeof localStorage === "undefined") return []; try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const save = (l: T[]) => localStorage.setItem(key, JSON.stringify(l));
  return { load, save, upsert: (x: T) => { const l = load().filter((y) => y.id !== x.id); save([x, ...l]); }, remove: (id: string) => save(load().filter((y) => y.id !== id)) };
}

export type Foot = "L" | "R" | "B";
export type RosterPlayer = { id: string; name: string; number: number; position: string; foot: Foot; pace: number; technique: number; physical: number; vision: number; defending: number };
export type Team = { id: string; name: string; coach: string; color: string; players: RosterPlayer[] };
export const teams = collection<Team>("fts-teams");
export const playerRating = (p: RosterPlayer) => Math.round((p.pace + p.technique + p.physical + p.vision + p.defending) / 5);

export type Mark = { id: string; kind: "run" | "pass" | "shot" | "block"; from: [number, number]; to: [number, number] };
export type SetPiece = { id: string; name: string; type: "corner" | "freekick" | "throwin"; attackers: [number, number][]; defenders: [number, number][]; ball: [number, number]; marks: Mark[]; notes: string; updatedAt: number };
export const setPieces = collection<SetPiece>("fts-setpieces");

export type Drill = { id: string; title: string; category: "technical" | "tactical" | "physical" | "setpiece" | "goalkeeping"; minutes: number; players: number; intensity: 1 | 2 | 3; description: string; custom?: boolean };
export const drills = collection<Drill>("fts-drills");

export type MatchPlan = { id: string; opponent: string; date: string; venue: "home" | "away"; tacticId: string; teamId: string; opponentFormation: string; strengths: string; weaknesses: string; inPossession: string; outOfPossession: string; setPieceNotes: string; drillIds: string[]; updatedAt: number };
export const plans = collection<MatchPlan>("fts-plans");
