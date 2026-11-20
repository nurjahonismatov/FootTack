import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n, useTr } from "@/lib/i18n";
import { playerRating, teams, uid, type RosterPlayer, type Team } from "@/lib/store";
import { FORMATIONS, newTactic, upsert } from "@/lib/tactics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teams")({
  head: () => ({ meta: [{ title: "My Teams — Football Tactical Studio" }, { name: "description", content: "Manage your squad: names, numbers, positions and player attributes." }, { property: "og:title", content: "My Teams — Football Tactical Studio" }, { property: "og:description", content: "Manage your squad: names, numbers, positions and player attributes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Teams,
});

const POS = ["GK", "LB", "LCB", "CB", "RCB", "RB", "LWB", "RWB", "CDM", "DM", "LCM", "CM", "RCM", "CAM", "LM", "RM", "LW", "RW", "ST"];
const ATTR = ["pace", "technique", "physical", "vision", "defending"] as const;
const newPlayer = (n: number): RosterPlayer => ({ id: uid(), name: "", number: n, position: "CM", foot: "R", pace: 60, technique: 60, physical: 60, vision: 60, defending: 60 });

function Teams() {
  const { t, lang } = useI18n(); const tr = useTr(); const nav = useNavigate();
  const [list, setList] = useState<Team[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [formation, setFormation] = useState("4-3-3");
  useEffect(() => { const l = teams.load(); setList(l); setSelId(l[0]?.id ?? null); }, []);
  const team = list.find((x) => x.id === selId) ?? null;
  const write = (tm: Team) => { teams.upsert(tm); setList(teams.load()); };
  const setP = (pid: string, patch: Partial<RosterPlayer>) => team && write({ ...team, players: team.players.map((p) => (p.id === pid ? { ...p, ...patch } : p)) });
  const create = () => { const tm: Team = { id: uid(), name: tr({ uz: "Yangi jamoa", ru: "Новая команда", en: "New team" }), coach: "", color: "green", players: Array.from({ length: 11 }, (_, i) => ({ ...newPlayer(i + 1), position: FORMATIONS["4-3-3"]![i]![0] })) }; write(tm); setSelId(tm.id); };
  const toTactic = () => {
    if (!team) return; const tac = newTactic(formation); const used = new Set<string>();
    tac.players = tac.players.map((slot) => {
      const m = team.players.find((p) => !used.has(p.id) && p.position === slot.position) ?? team.players.find((p) => !used.has(p.id) && p.position !== "GK" && slot.position !== "GK") ?? team.players.find((p) => !used.has(p.id));
      if (!m) return slot; used.add(m.id); return { ...slot, name: m.name, number: m.number };
    });
    tac.name = `${team.name} ${formation}`; upsert(tac); toast.success(t("savedOk")); nav({ to: "/editor", search: { id: tac.id } });
  };
  const avg = team && team.players.length ? Math.round(team.players.reduce((a, p) => a + playerRating(p), 0) / team.players.length) : 0;

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[240px_1fr] animate-rise">
      <aside className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
        <button onClick={create} className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" />{tr({ uz: "Jamoa qo‘shish", ru: "Добавить команду", en: "Add team" })}</button>
        {list.map((x) => <button key={x.id} onClick={() => setSelId(x.id)} className={cn("rounded-md px-3 py-2 text-left text-sm hover:bg-secondary", x.id === selId && "bg-secondary text-primary")}>{x.name}<span className="block text-xs text-muted-foreground">{x.players.length} {t("players")}</span></button>)}
      </aside>
      {!team ? <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{tr({ uz: "Birinchi jamoangizni yarating.", ru: "Создайте первую команду.", en: "Create your first team." })}</p> : (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3">
            <label className="text-xs text-muted-foreground">{tr({ uz: "Jamoa nomi", ru: "Название", en: "Team name" })}<input value={team.name} onChange={(e) => write({ ...team, name: e.target.value })} className="mt-1 block h-9 w-52 rounded-md border border-input bg-background px-2 text-sm text-foreground" /></label>
            <label className="text-xs text-muted-foreground">{tr({ uz: "Murabbiy", ru: "Тренер", en: "Coach" })}<input value={team.coach} onChange={(e) => write({ ...team, coach: e.target.value })} className="mt-1 block h-9 w-44 rounded-md border border-input bg-background px-2 text-sm text-foreground" /></label>
            <div className="rounded-md border border-border px-3 py-1.5 text-center"><div className="text-lg font-extrabold text-primary">{avg}</div><div className="text-[10px] uppercase text-muted-foreground">{tr({ uz: "O‘rtacha reyting", ru: "Средний рейтинг", en: "Avg rating" })}</div></div>
            <div className="ml-auto flex items-center gap-2">
              <select value={formation} onChange={(e) => setFormation(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}</select>
              <button onClick={toTactic} className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-glow"><Wand2 className="h-4 w-4" />{tr({ uz: "Taktik taxtaga yuklash", ru: "На тактическую доску", en: "Send to board" })}</button>
              <button onClick={() => { teams.remove(team.id); const l = teams.load(); setList(l); setSelId(l[0]?.id ?? null); }} className="rounded-md border border-destructive/50 p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-border">
                <th className="p-2">#</th><th className="p-2 text-left">{t("playerName")}</th><th className="p-2">{t("position")}</th><th className="p-2">{tr({ uz: "Oyoq", ru: "Нога", en: "Foot" })}</th>
                {ATTR.map((a) => <th key={a} className="p-2">{({ pace: { uz: "Tezlik", ru: "Скор.", en: "Pace" }, technique: { uz: "Texnika", ru: "Техн.", en: "Tech" }, physical: { uz: "Kuch", ru: "Физ.", en: "Phys" }, vision: { uz: "Ko‘rish", ru: "Видение", en: "Vision" }, defending: { uz: "Himoya", ru: "Защ.", en: "Def" } } as const)[a][lang]}</th>)}
                <th className="p-2">OVR</th><th /></tr></thead>
              <tbody>{team.players.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-1"><input type="number" min={1} max={99} value={p.number} onChange={(e) => setP(p.id, { number: +e.target.value })} className="h-8 w-14 rounded border border-input bg-background px-1 text-center" /></td>
                  <td className="p-1"><input value={p.name} placeholder={t("playerName")} onChange={(e) => setP(p.id, { name: e.target.value })} className="h-8 w-40 rounded border border-input bg-background px-2" /></td>
                  <td className="p-1"><select value={p.position} onChange={(e) => setP(p.id, { position: e.target.value })} className="h-8 rounded border border-input bg-background px-1">{POS.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td className="p-1"><select value={p.foot} onChange={(e) => setP(p.id, { foot: e.target.value as RosterPlayer["foot"] })} className="h-8 rounded border border-input bg-background px-1"><option>L</option><option>R</option><option>B</option></select></td>
                  {ATTR.map((a) => <td key={a} className="p-1"><input type="number" min={1} max={99} value={p[a]} onChange={(e) => setP(p.id, { [a]: Math.max(1, Math.min(99, +e.target.value)) })} className="h-8 w-14 rounded border border-input bg-background px-1 text-center" /></td>)}
                  <td className="p-1 text-center font-extrabold text-primary">{playerRating(p)}</td>
                  <td className="p-1"><button onClick={() => write({ ...team, players: team.players.filter((x) => x.id !== p.id) })} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>))}</tbody>
            </table>
            <button onClick={() => write({ ...team, players: [...team.players, newPlayer(team.players.length + 1)] })} className="m-2 flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"><Plus className="h-4 w-4" />{tr({ uz: "O‘yinchi qo‘shish", ru: "Добавить игрока", en: "Add player" })}</button>
          </div>
        </section>
      )}
    </div>
  );
}
