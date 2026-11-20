import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Hand, Plus, Save, Shield, Target, Trash2, Undo2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Pitch, Dot } from "@/components/Pitch";
import { useI18n, useTr } from "@/lib/i18n";
import { setPieces, uid, type Mark, type SetPiece } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/set-pieces")({
  head: () => ({ meta: [{ title: "Set-Piece Studio — Football Tactical Studio" }, { name: "description", content: "Design corners, free kicks and throw-ins with runs, passes and blocks." }, { property: "og:title", content: "Set-Piece Studio — Football Tactical Studio" }, { property: "og:description", content: "Design corners, free kicks and throw-ins with runs, passes and blocks." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Studio,
});

type Tool = "move" | Mark["kind"];
const TEMPLATES: Record<SetPiece["type"], () => Omit<SetPiece, "id" | "name" | "notes" | "updatedAt" | "type">> = {
  corner: () => ({ ball: [104.5, 0.5], attackers: [[104, 1], [96, 28], [94, 36], [92, 42], [98, 46], [86, 34], [80, 20], [80, 48], [60, 30], [55, 40]], defenders: [[104, 34], [101, 30], [101, 38], [99, 26], [99, 34], [99, 42], [97, 30], [97, 38], [95, 46], [90, 34]], marks: [] }),
  freekick: () => ({ ball: [78, 30], attackers: [[78, 30], [79, 34], [90, 22], [92, 30], [92, 38], [90, 46], [84, 50], [70, 34], [60, 20], [60, 48]], defenders: [[104, 34], [87, 28], [87, 30], [87, 32], [87, 34], [96, 24], [96, 32], [96, 40], [94, 46], [92, 36]], marks: [] }),
  throwin: () => ({ ball: [80, 68], attackers: [[80, 68], [82, 62], [76, 60], [88, 58], [72, 52], [94, 44], [92, 34], [65, 40], [55, 30], [50, 50]], defenders: [[104, 34], [83, 60], [78, 58], [88, 55], [74, 50], [96, 44], [96, 34], [90, 40], [70, 42], [85, 48]], marks: [] }),
};
const blank = (type: SetPiece["type"], name: string): SetPiece => ({ id: uid(), name, type, notes: "", updatedAt: Date.now(), ...TEMPLATES[type]() });

function Studio() {
  const { t } = useI18n(); const tr = useTr();
  const [list, setList] = useState<SetPiece[]>([]);
  const [sp, setSp] = useState<SetPiece>(() => blank("corner", ""));
  const [tool, setTool] = useState<Tool>("move");
  const [drag, setDrag] = useState<{ k: "a" | "d" | "b"; i: number } | null>(null);
  const [draft, setDraft] = useState<Mark | null>(null);
  const [anim, setAnim] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => { const l = setPieces.load(); setList(l); if (l[0]) setSp(l[0]); }, []);
  useEffect(() => { if (!anim) return; const id = setTimeout(() => setAnim(false), 1600); return () => clearTimeout(id); }, [anim]);

  const pt = (e: React.PointerEvent): [number, number] => { const s = svg.current!; const p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const r = p.matrixTransform(s.getScreenCTM()!.inverse()); return [+Math.max(0, Math.min(105, r.x)).toFixed(1), +Math.max(0, Math.min(68, r.y)).toFixed(1)]; };
  const down = (e: React.PointerEvent) => { if (tool === "move") return; const p = pt(e); setDraft({ id: uid(), kind: tool, from: p, to: p }); };
  const move = (e: React.PointerEvent) => {
    const p = pt(e);
    if (drag) setSp((s) => drag.k === "b" ? { ...s, ball: p } : drag.k === "a" ? { ...s, attackers: s.attackers.map((x, i) => (i === drag.i ? p : x)) } : { ...s, defenders: s.defenders.map((x, i) => (i === drag.i ? p : x)) });
    else if (draft) setDraft({ ...draft, to: p });
  };
  const up = () => { if (draft && Math.hypot(draft.to[0] - draft.from[0], draft.to[1] - draft.from[1]) > 1.5) setSp((s) => ({ ...s, marks: [...s.marks, draft] })); setDraft(null); setDrag(null); };
  const grab = (k: "a" | "d" | "b", i: number) => tool === "move" ? (e: React.PointerEvent) => { e.stopPropagation(); setDrag({ k, i }); } : undefined;
  const save = () => { const x = { ...sp, name: sp.name || tr({ uz: "Nomsiz", ru: "Без названия", en: "Untitled" }), updatedAt: Date.now() }; setPieces.upsert(x); setSp(x); setList(setPieces.load()); toast.success(t("savedOk")); };

  const color = { run: "var(--run)", pass: "var(--pass)", shot: "var(--opponent)", block: "var(--foreground)" };
  const markEl = (m: Mark, ghost = false) => {
    const mx = (m.from[0] + m.to[0]) / 2, my = (m.from[1] + m.to[1]) / 2; const dx = m.to[0] - m.from[0], dy = m.to[1] - m.from[1];
    const d = m.kind === "pass" ? `M${m.from[0]} ${m.from[1]} Q${mx - dy * 0.2} ${my + dx * 0.2} ${m.to[0]} ${m.to[1]}` : `M${m.from[0]} ${m.from[1]} L${m.to[0]} ${m.to[1]}`;
    return <path key={m.id} d={d} fill="none" stroke={color[m.kind]} strokeWidth={m.kind === "block" ? 0.7 : 0.45} strokeDasharray={m.kind === "run" ? "1.2 0.8" : undefined} markerEnd={m.kind === "block" ? undefined : `url(#arrow-${m.kind})`} opacity={ghost ? 0.6 : 1} className={anim ? "animate-draw" : ""} pointerEvents="none" />;
  };
  const TOOLS: [Tool, typeof Hand, { uz: string; ru: string; en: string }][] = [
    ["move", Hand, { uz: "Siljitish", ru: "Двигать", en: "Move" }], ["run", Zap, { uz: "Yugurish", ru: "Рывок", en: "Run" }], ["pass", ArrowUpRight, { uz: "Uzatma", ru: "Пас", en: "Pass" }], ["shot", Target, { uz: "Zarba", ru: "Удар", en: "Shot" }], ["block", Shield, { uz: "To‘siq", ru: "Блок", en: "Screen" }],
  ];
  const TYPES: [SetPiece["type"], { uz: string; ru: string; en: string }][] = [["corner", { uz: "Burchak", ru: "Угловой", en: "Corner" }], ["freekick", { uz: "Jarima", ru: "Штрафной", en: "Free kick" }], ["throwin", { uz: "Aut", ru: "Аут", en: "Throw-in" }]];

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[220px_1fr_260px] animate-rise">
      <aside className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
        {TYPES.map(([k, l]) => <button key={k} onClick={() => setSp(blank(k, ""))} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"><Plus className="h-4 w-4" />{tr(l)}</button>)}
        <div className="my-1 border-t border-border" />
        {list.map((x) => <div key={x.id} className={cn("flex items-center rounded-md hover:bg-secondary", x.id === sp.id && "bg-secondary text-primary")}><button onClick={() => setSp(x)} className="flex-1 px-2 py-1.5 text-left text-sm">{x.name}<span className="block text-[10px] text-muted-foreground">{tr(TYPES.find((y) => y[0] === x.type)![1])}</span></button><button onClick={() => { setPieces.remove(x.id); setList(setPieces.load()); }} className="p-1 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
      </aside>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input value={sp.name} onChange={(e) => setSp({ ...sp, name: e.target.value })} placeholder={tr({ uz: "Variant nomi", ru: "Название розыгрыша", en: "Routine name" })} className="h-9 w-56 rounded-md border border-input bg-card px-3 text-sm" />
          <div className="flex rounded-md border border-border p-0.5">{TOOLS.map(([k, I, l]) => <button key={k} onClick={() => setTool(k)} className={cn("flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold", tool === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}><I className="h-3.5 w-3.5" />{tr(l)}</button>)}</div>
          <button onClick={() => setSp({ ...sp, marks: sp.marks.slice(0, -1) })} className="rounded-md border border-border p-2 hover:bg-secondary"><Undo2 className="h-4 w-4" /></button>
          <button onClick={() => setAnim(true)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">▶ {tr({ uz: "Ko‘rsatish", ru: "Показать", en: "Replay" })}</button>
          <button onClick={save} className="ml-auto flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"><Save className="h-4 w-4" />{t("save")}</button>
        </div>
        <Pitch ref={svg} className={tool !== "move" ? "cursor-crosshair" : ""} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
          {sp.marks.map((m) => markEl(m))}{draft && markEl(draft, true)}
          {sp.defenders.map((p, i) => <Dot key={"d" + i} x={p[0]} y={p[1]} label={i + 1} tone="opp" onPointerDown={grab("d", i)} />)}
          {sp.attackers.map((p, i) => <Dot key={"a" + i} x={p[0]} y={p[1]} label={i + 2} tone="own" onPointerDown={grab("a", i)} />)}
          <g style={{ transform: `translate(${sp.ball[0]}px, ${sp.ball[1]}px)` }} onPointerDown={grab("b", 0)} cursor={tool === "move" ? "grab" : undefined}><circle r={1} fill="var(--ball)" stroke="var(--background)" strokeWidth={0.25} /></g>
        </Pitch>
      </div>
      <aside className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm">
        <h3 className="text-xs font-bold uppercase text-muted-foreground">{tr({ uz: "Belgilar", ru: "Легенда", en: "Legend" })}</h3>
        <ul className="flex flex-col gap-1 text-xs">{TOOLS.slice(1).map(([k, , l]) => <li key={k} className="flex items-center gap-2"><span className={cn("h-1 w-6 rounded", k === "run" ? "bg-run" : k === "pass" ? "bg-pass" : k === "shot" ? "bg-opponent" : "bg-foreground")} />{tr(l)}</li>)}</ul>
        <p className="text-xs text-muted-foreground">{tr({ uz: "Chiziq chizish uchun asbobni tanlab, maydonda sudrang. O‘yinchilar va to‘pni ‘Siljitish’ rejimida joylashtiring.", ru: "Выберите инструмент и проведите по полю. Игроков и мяч двигайте в режиме «Двигать».", en: "Pick a tool and drag on the pitch to draw. Use Move to place players and the ball." })}</p>
        <label className="text-xs text-muted-foreground">{tr({ uz: "Ko‘rsatmalar", ru: "Инструкции", en: "Instructions" })}<textarea value={sp.notes} onChange={(e) => setSp({ ...sp, notes: e.target.value })} rows={8} className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground" /></label>
      </aside>
    </div>
  );
}
