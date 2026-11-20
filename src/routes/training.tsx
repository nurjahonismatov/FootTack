import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Flame, Plus, Trash2, Users } from "lucide-react";
import { useI18n, useTr } from "@/lib/i18n";
import { drills, uid, type Drill } from "@/lib/store";
import { BUILTIN } from "@/lib/drills";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training Ground — Football Tactical Studio" }, { name: "description", content: "Drill cards for technical, tactical, physical and set-piece sessions." }, { property: "og:title", content: "Training Ground — Football Tactical Studio" }, { property: "og:description", content: "Drill cards for technical, tactical, physical and set-piece sessions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Training,
});

export const CATS: [Drill["category"], Record<"uz" | "ru" | "en", string>][] = [["technical", { uz: "Texnik", ru: "Техника", en: "Technical" }], ["tactical", { uz: "Taktik", ru: "Тактика", en: "Tactical" }], ["physical", { uz: "Jismoniy", ru: "Физика", en: "Physical" }], ["setpiece", { uz: "Standartlar", ru: "Стандарты", en: "Set pieces" }], ["goalkeeping", { uz: "Darvozabon", ru: "Вратари", en: "Goalkeeping" }]];

function Training() {
  const { lang } = useI18n(); const tr = useTr();
  const [custom, setCustom] = useState<Drill[]>([]); const [cat, setCat] = useState<string>("all"); const [form, setForm] = useState(false);
  const [d, setD] = useState<Drill>({ id: "", title: "", category: "tactical", minutes: 15, players: 10, intensity: 2, description: "" });
  useEffect(() => setCustom(drills.load()), []);
  const all: Drill[] = [...custom, ...BUILTIN.map((b) => ({ ...b, title: b.title[lang], description: b.description[lang] }))].filter((x) => cat === "all" || x.category === cat);
  const total = all.reduce((a, b) => a + b.minutes, 0);
  const add = () => { if (!d.title.trim()) return; drills.upsert({ ...d, id: uid(), custom: true }); setCustom(drills.load()); setForm(false); setD({ ...d, title: "", description: "" }); };
  const input = "mt-1 block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground";
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 animate-rise">
      <div className="flex flex-wrap items-center gap-2">
        {[["all", { uz: "Barchasi", ru: "Все", en: "All" }] as const, ...CATS].map(([k, l]) => <button key={k} onClick={() => setCat(k)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", cat === k ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{tr(l)}</button>)}
        <span className="text-xs text-muted-foreground">{all.length} · {total} {tr({ uz: "daq", ru: "мин", en: "min" })}</span>
        <button onClick={() => setForm(!form)} className="ml-auto flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" />{tr({ uz: "Mashq qo‘shish", ru: "Добавить упражнение", en: "Add drill" })}</button>
      </div>
      {form && <div className="grid gap-3 rounded-xl border border-primary/50 bg-card p-4 text-xs text-muted-foreground sm:grid-cols-5">
        <label className="sm:col-span-2">{tr({ uz: "Nomi", ru: "Название", en: "Title" })}<input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={input} /></label>
        <label>{tr({ uz: "Turi", ru: "Тип", en: "Category" })}<select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as Drill["category"] })} className={input}>{CATS.map(([k, l]) => <option key={k} value={k}>{tr(l)}</option>)}</select></label>
        <label>{tr({ uz: "Daqiqa", ru: "Минуты", en: "Minutes" })}<input type="number" min={1} value={d.minutes} onChange={(e) => setD({ ...d, minutes: +e.target.value })} className={input} /></label>
        <label>{tr({ uz: "O‘yinchilar", ru: "Игроки", en: "Players" })}<input type="number" min={1} value={d.players} onChange={(e) => setD({ ...d, players: +e.target.value })} className={input} /></label>
        <label className="sm:col-span-4">{tr({ uz: "Tavsif", ru: "Описание", en: "Description" })}<textarea value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} rows={2} className={input} /></label>
        <div className="flex items-end"><button onClick={add} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">OK</button></div>
      </div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((x) => (
          <article key={x.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <div className="flex items-start gap-2"><h3 className="flex-1 font-bold">{x.title}</h3><span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase text-primary">{tr(CATS.find((c) => c[0] === x.category)![1])}</span></div>
            <p className="flex-1 text-sm text-muted-foreground">{x.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{x.minutes}'</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{x.players}</span>
              <span className="flex">{[1, 2, 3].map((i) => <Flame key={i} className={cn("h-3.5 w-3.5", i <= x.intensity ? "text-warning" : "opacity-25")} />)}</span>
              {x.custom && <button onClick={() => { drills.remove(x.id); setCustom(drills.load()); }} className="ml-auto text-destructive"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
