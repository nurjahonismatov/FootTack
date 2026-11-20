import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n, useTr } from "@/lib/i18n";
import { drills, plans, setPieces, teams, uid, type Drill, type MatchPlan, type SetPiece, type Team } from "@/lib/store";
import { BUILTIN, resolveDrill } from "@/lib/drills";
import { FORMATIONS, loadAll, type Tactic } from "@/lib/tactics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plans")({
  head: () => ({ meta: [{ title: "Match Plans — Football Tactical Studio" }, { name: "description", content: "Pre-match game plans: opponent scouting, instructions and training." }, { property: "og:title", content: "Match Plans — Football Tactical Studio" }, { property: "og:description", content: "Pre-match game plans: opponent scouting, instructions and training." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Plans,
});
const empty = (): MatchPlan => ({ id: uid(), opponent: "", date: new Date().toISOString().slice(0, 10), venue: "home", tacticId: "", teamId: "", opponentFormation: "4-4-2", strengths: "", weaknesses: "", inPossession: "", outOfPossession: "", setPieceNotes: "", drillIds: [], updatedAt: Date.now() });

function Plans() {
  const { t, lang } = useI18n(); const tr = useTr();
  const [list, setList] = useState<MatchPlan[]>([]); const [p, setP] = useState<MatchPlan>(empty);
  const [tac, setTac] = useState<Tactic[]>([]); const [tms, setTms] = useState<Team[]>([]); const [sps, setSps] = useState<SetPiece[]>([]); const [cd, setCd] = useState<Drill[]>([]);
  useEffect(() => { const l = plans.load(); setList(l); if (l[0]) setP(l[0]); setTac(loadAll()); setTms(teams.load()); setSps(setPieces.load()); setCd(drills.load()); }, []);
  const save = () => { plans.upsert({ ...p, updatedAt: Date.now() }); setList(plans.load()); toast.success(t("savedOk")); };
  const input = "mt-1 block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground";
  const area = (k: keyof MatchPlan, l: Record<"uz" | "ru" | "en", string>) => <label className="text-xs text-muted-foreground">{tr(l)}<textarea rows={4} value={p[k] as string} onChange={(e) => setP({ ...p, [k]: e.target.value })} className={input} /></label>;
  const drillOpts = [...cd.map((d) => d.id), ...BUILTIN.map((b) => b.id)];
  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[240px_1fr] animate-rise">
      <aside className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 print:hidden">
        <button onClick={() => setP(empty())} className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" />{tr({ uz: "Yangi reja", ru: "Новый план", en: "New plan" })}</button>
        {list.map((x) => <div key={x.id} className={cn("flex items-center rounded-md hover:bg-secondary", x.id === p.id && "bg-secondary text-primary")}><button onClick={() => setP(x)} className="flex-1 px-2 py-1.5 text-left text-sm">vs {x.opponent || "—"}<span className="block text-[10px] text-muted-foreground">{x.date}</span></button><button onClick={() => { plans.remove(x.id); setList(plans.load()); }} className="p-1 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
      </aside>
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground">{tr({ uz: "Raqib", ru: "Соперник", en: "Opponent" })}<input value={p.opponent} onChange={(e) => setP({ ...p, opponent: e.target.value })} className={input} /></label>
          <label className="text-xs text-muted-foreground">{tr({ uz: "Sana", ru: "Дата", en: "Date" })}<input type="date" value={p.date} onChange={(e) => setP({ ...p, date: e.target.value })} className={input} /></label>
          <label className="text-xs text-muted-foreground">{tr({ uz: "Joy", ru: "Место", en: "Venue" })}<select value={p.venue} onChange={(e) => setP({ ...p, venue: e.target.value as MatchPlan["venue"] })} className={input}><option value="home">{tr({ uz: "Uyda", ru: "Дома", en: "Home" })}</option><option value="away">{tr({ uz: "Mehmonda", ru: "В гостях", en: "Away" })}</option></select></label>
          <label className="text-xs text-muted-foreground">{t("teams")}<select value={p.teamId} onChange={(e) => setP({ ...p, teamId: e.target.value })} className={input}><option value="">—</option>{tms.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">{tr({ uz: "Bizning taktika", ru: "Наша тактика", en: "Our tactic" })}<select value={p.tacticId} onChange={(e) => setP({ ...p, tacticId: e.target.value })} className={input}><option value="">—</option>{tac.map((x) => <option key={x.id} value={x.id}>{x.name || x.formation}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">{tr({ uz: "Raqib sxemasi", ru: "Схема соперника", en: "Opponent formation" })}<select value={p.opponentFormation} onChange={(e) => setP({ ...p, opponentFormation: e.target.value })} className={input}>{Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}</select></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {area("strengths", { uz: "Raqibning kuchli tomonlari", ru: "Сильные стороны соперника", en: "Opponent strengths" })}
          {area("weaknesses", { uz: "Raqibning zaif tomonlari", ru: "Слабые стороны соперника", en: "Opponent weaknesses" })}
          {area("inPossession", { uz: "To‘p bizda bo‘lganda", ru: "С мячом", en: "In possession" })}
          {area("outOfPossession", { uz: "To‘p raqibda bo‘lganda", ru: "Без мяча", en: "Out of possession" })}
        </div>
        {area("setPieceNotes", { uz: "Standart vaziyatlar", ru: "Стандарты", en: "Set pieces" })}
        {sps.length > 0 && <p className="text-xs text-muted-foreground">{tr({ uz: "Studiyadagi variantlar", ru: "Розыгрыши из студии", en: "Studio routines" })}: {sps.map((s) => s.name).join(", ")}</p>}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{tr({ uz: "Haftalik mashg‘ulotlar", ru: "Тренировки недели", en: "Training this week" })}</h3>
          <div className="flex flex-wrap gap-1">{drillOpts.map((id) => { const d = resolveDrill(id, lang, cd)!; const on = p.drillIds.includes(id); return <button key={id} onClick={() => setP({ ...p, drillIds: on ? p.drillIds.filter((x) => x !== id) : [...p.drillIds, id] })} className={cn("rounded-full border px-3 py-1 text-xs", on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>{d.title} · {d.minutes}'</button>; })}</div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={save} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"><Save className="h-4 w-4" />{t("save")}</button>
          <button onClick={() => window.print()} className="flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"><Printer className="h-4 w-4" />{tr({ uz: "Chop etish", ru: "Печать", en: "Print" })}</button>
        </div>
      </section>
    </div>
  );
}
