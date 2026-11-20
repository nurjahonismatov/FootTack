import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eraser, Hand, Paintbrush, Play, Redo2, Save, Square, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { TacticalBoard, type Tool } from "@/components/TacticalBoard";
import { PHASES, phaseNames, useI18n, type Phase } from "@/lib/i18n";
import { FORMATIONS, getPhase, loadAll, newTactic, upsert, type Tactic } from "@/lib/tactics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editor")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? (s["id"] as string) : undefined }),
  head: () => ({ meta: [{ title: "Tactical Board — Football Tactical Studio" }, { name: "description", content: "Position players, paint activity zones and build phase tactics." }, { property: "og:title", content: "Tactical Board — Football Tactical Studio" }, { property: "og:description", content: "Position players, paint activity zones and build phase tactics." }] }),
  component: Editor,
});

const POSITIONS = ["GK","CB","LCB","RCB","LB","RB","LWB","RWB","SW","CDM","DM","CM","LCM","RCM","CAM","AM","LM","RM","LW","RW","LF","RF","CF","ST","SS"];
const PLAY_ORDER: Phase[] = ["balanced", "attacking", "balanced", "defensive"];

function Editor() {
  const { t, lang } = useI18n();
  const { id } = Route.useSearch();
  const [tac, setTac] = useState<Tactic>(() => newTactic());
  const [phase, setPhase] = useState<Phase>("balanced");
  const [sel, setSel] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("move");
  const [brush, setBrush] = useState(3);
  const [intensity, setIntensity] = useState(100);
  const [grid, setGrid] = useState(true);
  const [snap, setSnap] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [playing, setPlaying] = useState(false);
  const hist = useRef<{ past: Tactic[]; future: Tactic[]; last: Tactic | null }>({ past: [], future: [], last: null });

  useEffect(() => { const f = id && loadAll().find((x) => x.id === id); const n = f || newTactic(); setTac(n); hist.current = { past: [], future: [], last: n }; }, [id]);
  useEffect(() => {
    if (!playing) return; let i = 0;
    const iv = setInterval(() => { i = (i + 1) % PLAY_ORDER.length; setPhase(PLAY_ORDER[i]!); }, 1600);
    return () => clearInterval(iv);
  }, [playing]);

  const data = getPhase(tac, phase);
  const commit = (next?: Tactic) => { const h = hist.current; if (h.last) h.past.push(h.last); h.future = []; h.last = next ?? tac; };
  const setPhaseData = (fn: (d: typeof data) => typeof data) => setTac((t0) => ({ ...t0, phases: { ...t0.phases, [phase]: fn(getPhase(t0, phase)) } }));
  const undo = () => { const h = hist.current; const p = h.past.pop(); if (!p) return; if (h.last) h.future.push(h.last); h.last = p; setTac(p); };
  const redo = () => { const h = hist.current; const f = h.future.pop(); if (!f) return; if (h.last) h.past.push(h.last); h.last = f; setTac(f); };
  const edit = (fn: (t0: Tactic) => Tactic) => setTac((t0) => { const n = fn(t0); commit(n); return n; });
  const player = tac.players.find((x) => x.id === sel);
  const zoneVals = sel ? Object.values(data.zones[sel] || {}) : [];

  const applyFormation = (f: string) => edit((t0) => {
    const pos = { ...getPhase(t0, phase).pos };
    const players = t0.players.map((pl, i) => { const s = FORMATIONS[f]?.[i]; if (s) pos[pl.id] = [s[1], s[2]]; return s ? { ...pl, position: s[0] } : pl; });
    return { ...t0, formation: f, players, phases: { ...t0.phases, [phase]: { ...getPhase(t0, phase), pos } } };
  });
  const save = () => { const n = { ...tac, name: tac.name || `${t("newTactic")} ${tac.formation}` }; setTac(n); upsert(n); toast.success(t("savedOk")); };

  return (
    <div className="flex flex-col gap-3 animate-rise">
      <div className="flex flex-wrap items-center gap-2">
        <input value={tac.name} onChange={(e) => setTac({ ...tac, name: e.target.value })} placeholder={t("name")} className="h-9 w-56 rounded-md border border-input bg-card px-3 text-sm" />
        <select value={tac.formation} onChange={(e) => applyFormation(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
          {Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}
        </select>
        <div className="flex rounded-md border border-border p-0.5">
          {([["move", Hand], ["paint", Paintbrush], ["erase", Eraser]] as const).map(([k, I]) => (
            <button key={k} title={t(k)} onClick={() => setTool(k)} className={cn("flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold", tool === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}><I className="h-3.5 w-3.5" />{t(k)}</button>
          ))}
        </div>
        <button onClick={undo} title={t("undo")} className="rounded-md border border-border p-2 hover:bg-secondary"><Undo2 className="h-4 w-4" /></button>
        <button onClick={redo} title={t("redo")} className="rounded-md border border-border p-2 hover:bg-secondary"><Redo2 className="h-4 w-4" /></button>
        <button onClick={() => setPlaying(!playing)} className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">{playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? t("stop") : t("play")}</button>
        <button onClick={save} className="ml-auto flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90"><Save className="h-4 w-4" />{t("save")}</button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {PHASES.map((ph) => (
          <button key={ph} onClick={() => setPhase(ph)} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-colors", phase === ph ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground", tac.phases[ph] && phase !== ph && "text-foreground")}>{phaseNames[lang][ph]}</button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[180px_1fr_260px]">
        <div className="rounded-xl border border-border bg-card p-3">
          <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{t("players")}</h3>
          <ul className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {tac.players.map((pl) => (
              <li key={pl.id}><button onClick={() => setSel(pl.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary", sel === pl.id && "bg-secondary text-primary")}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-xs font-bold text-background">{pl.number}</span>
                <span className="truncate">{pl.name || pl.position}</span><span className="ml-auto text-[10px] text-muted-foreground">{pl.position}</span>
              </button></li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <TacticalBoard data={data} players={tac.players} selected={sel} tool={tool} brush={brush} intensity={intensity} showGrid={grid} snap={snap} showAll={showAll}
            onSelect={setSel} onMove={(pid, p) => setPhaseData((d) => ({ ...d, pos: { ...d.pos, [pid]: p } }))}
            onZones={(pid, z) => setPhaseData((d) => ({ ...d, zones: { ...d.zones, [pid]: z } }))} onCommit={() => commit()} />
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <label className="flex items-center gap-1"><input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />{t("grid")}</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} />{t("snap")}</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />{t("showAllZones")}</label>
            <span className="ml-auto flex items-center gap-2">{t("legend")}:
              {([[100, "primary"], [70, "secondary"], [40, "occasional"], [15, "rare"]] as const).map(([v, k]) => <span key={k} className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-zone" style={{ opacity: v / 100 }} />{t(k)}</span>)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm">
          <h3 className="text-xs font-bold uppercase text-muted-foreground">{t("inspector")}</h3>
          {!player ? <p className="text-muted-foreground">{t("selectPlayer")}</p> : <>
            <div className="grid grid-cols-[70px_1fr] gap-2">
              <label className="text-xs text-muted-foreground">{t("number")}<input type="number" min={1} max={50} value={player.number} onChange={(e) => edit((t0) => ({ ...t0, players: t0.players.map((x) => x.id === sel ? { ...x, number: Math.max(1, Math.min(50, +e.target.value)) } : x) }))} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-foreground" /></label>
              <label className="text-xs text-muted-foreground">{t("playerName")}<input value={player.name} onChange={(e) => setTac((t0) => ({ ...t0, players: t0.players.map((x) => x.id === sel ? { ...x, name: e.target.value } : x) }))} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-foreground" /></label>
            </div>
            <label className="text-xs text-muted-foreground">{t("position")}
              <select value={player.position} onChange={(e) => edit((t0) => ({ ...t0, players: t0.players.map((x) => x.id === sel ? { ...x, position: e.target.value } : x) }))} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-foreground">{POSITIONS.map((p) => <option key={p}>{p}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!player.captain} onChange={(e) => edit((t0) => ({ ...t0, players: t0.players.map((x) => ({ ...x, captain: x.id === sel ? e.target.checked : e.target.checked ? false : x.captain })) }))} />{t("captain")}</label>
            <p className="text-xs text-muted-foreground">{t("coords")}: {data.pos[player.id]?.[0]}m × {data.pos[player.id]?.[1]}m</p>
            <hr className="border-border" />
            <label className="text-xs text-muted-foreground">{t("intensity")}: <b className="text-primary">{intensity}%</b>
              <div className="mt-1 flex gap-2"><input type="range" min={0} max={100} step={5} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="flex-1 accent-primary" />
                <input type="number" min={0} max={100} value={intensity} onChange={(e) => setIntensity(Math.max(0, Math.min(100, +e.target.value)))} className="h-7 w-14 rounded border border-input bg-background px-1 text-foreground" /></div>
            </label>
            <div className="flex flex-wrap gap-1">{[100, 80, 60, 30, 10].map((v) => <button key={v} onClick={() => { setIntensity(v); setTool("paint"); }} className="rounded border border-border px-2 py-0.5 text-xs hover:border-primary">{v}%</button>)}</div>
            <label className="text-xs text-muted-foreground">{t("brush")}: {brush}m<input type="range" min={1} max={8} value={brush} onChange={(e) => setBrush(+e.target.value)} className="w-full accent-primary" /></label>
            <label className="text-xs text-muted-foreground">{t("copyZone")}
              <select value="" onChange={(e) => { const src = data.zones[e.target.value]; if (src) { edit((t0) => ({ ...t0, phases: { ...t0.phases, [phase]: { ...getPhase(t0, phase), zones: { ...getPhase(t0, phase).zones, [sel!]: { ...src } } } } })); } }} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-foreground">
                <option value="">—</option>{tac.players.filter((x) => x.id !== sel && data.zones[x.id]).map((x) => <option key={x.id} value={x.id}>#{x.number} {x.name || x.position}</option>)}
              </select>
            </label>
            <button onClick={() => edit((t0) => { const d = getPhase(t0, phase); const z = { ...d.zones }; delete z[sel!]; return { ...t0, phases: { ...t0.phases, [phase]: { ...d, zones: z } } }; })} className="rounded-md border border-destructive/50 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10">{t("clearZones")}</button>
            <p className="text-[11px] text-muted-foreground">{zoneVals.length} m² · {t("zoneNote")}</p>
          </>}
        </div>
      </div>
    </div>
  );
}
