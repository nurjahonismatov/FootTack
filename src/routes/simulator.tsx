import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Play, Shuffle } from "lucide-react";
import { Dot, Pitch } from "@/components/Pitch";
import { useI18n, useTr } from "@/lib/i18n";
import { analyse, mirror, simulate, type Pt } from "@/lib/analysis";
import { FORMATIONS, loadAll, type Tactic } from "@/lib/tactics";
import { playerRating, teams, type Team } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulator")({
  head: () => ({ meta: [{ title: "Match Simulator — Football Tactical Studio" }, { name: "description", content: "Test your tactic against a virtual 11v11 opponent and find weak spots." }, { property: "og:title", content: "Match Simulator — Football Tactical Studio" }, { property: "og:description", content: "Test your tactic against a virtual 11v11 opponent and find weak spots." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Simulator,
});

const fPts = (f: string): Pt[] => FORMATIONS[f]!.map(([, x, y]) => [x, y]);

function Simulator() {
  const { t } = useI18n(); const tr = useTr();
  const [tactics, setTactics] = useState<Tactic[]>([]); const [tms, setTms] = useState<Team[]>([]);
  const [src, setSrc] = useState("f:4-3-3"); const [opp, setOpp] = useState("4-4-2"); const [teamId, setTeamId] = useState("");
  const [oppRating, setOppRating] = useState(70); const [seed, setSeed] = useState(1); const [run, setRun] = useState(false); const [minute, setMinute] = useState(90);
  useEffect(() => { setTactics(loadAll()); setTms(teams.load()); }, []);

  const own: Pt[] = useMemo(() => {
    if (src.startsWith("t:")) { const tc = tactics.find((x) => "t:" + x.id === src); const b = tc?.phases.balanced; if (tc && b) return tc.players.map((p) => b.pos[p.id] ?? [50, 34]); }
    return fPts(src.slice(2) in FORMATIONS ? src.slice(2) : "4-3-3");
  }, [src, tactics]);
  const oppPts = useMemo(() => fPts(opp).map(mirror), [opp]);
  const ownR = analyse(own, oppPts); const oppR = analyse(fPts(opp), own.map(mirror));
  const team = tms.find((x) => x.id === teamId); const homeRating = team && team.players.length ? Math.round(team.players.reduce((a, p) => a + playerRating(p), 0) / team.players.length) : 70;
  const res = useMemo(() => simulate(ownR, oppR, seed, homeRating, oppRating), [ownR.attack, ownR.defence, oppR.attack, oppR.defence, seed, homeRating, oppRating]);

  useEffect(() => { if (!run) return; setMinute(0); const iv = setInterval(() => setMinute((m) => { if (m >= 90) { clearInterval(iv); setRun(false); return 90; } return m + 1; }), 60); return () => clearInterval(iv); }, [run, seed]);
  const shown = res.events.filter((e) => e.minute <= minute);
  const score = { home: shown.filter((e) => e.team === "home" && e.kind === "goal").length, away: shown.filter((e) => e.team === "away" && e.kind === "goal").length };

  const W: Record<string, { uz: string; ru: string; en: string }> = {
    narrow: { uz: "Jamoa juda tor — qanotlar ochiq qolmoqda.", ru: "Команда слишком узкая — фланги открыты.", en: "Shape is too narrow — flanks are exposed." },
    stretched: { uz: "Chiziqlar orasidagi masofa katta — markaz bo‘sh.", ru: "Большое расстояние между линиями — центр пуст.", en: "Lines are stretched — space between the lines." },
    highLine: { uz: "Himoya chizig‘i juda baland — orqaga uzatmalar xavfli.", ru: "Слишком высокая линия обороны — опасны забросы за спину.", en: "Very high defensive line — vulnerable to balls in behind." },
  };
  const ch = [{ uz: "chap", ru: "левом", en: "left" }, { uz: "markaz", ru: "центральном", en: "central" }, { uz: "o‘ng", ru: "правом", en: "right" }];
  const wText = (w: string) => { if (W[w]) return tr(W[w]!); const c = +w.split(":")[2]!; return tr({ uz: `Himoya zonasida ${ch[c]!.uz} kanalda son ustunligi raqibda.`, ru: `Численное преимущество соперника в ${ch[c]!.ru} канале у ваших ворот.`, en: `Opponent overloads your ${ch[c]!.en} defensive channel.` }); };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 animate-rise">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <label>{tr({ uz: "Sizning taktikangiz", ru: "Ваша тактика", en: "Your tactic" })}<select value={src} onChange={(e) => setSrc(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
          {Object.keys(FORMATIONS).map((f) => <option key={f} value={"f:" + f}>{t("formation")} {f}</option>)}
          {tactics.map((x) => <option key={x.id} value={"t:" + x.id}>{x.name || x.formation}</option>)}</select></label>
        <label>{t("teams")}<select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="">—</option>{tms.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label>{tr({ uz: "Raqib sxemasi", ru: "Схема соперника", en: "Opponent formation" })}<select value={opp} onChange={(e) => setOpp(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">{Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}</select></label>
        <label>{tr({ uz: "Raqib kuchi", ru: "Сила соперника", en: "Opponent strength" })}: {oppRating}<input type="range" min={40} max={95} value={oppRating} onChange={(e) => setOppRating(+e.target.value)} className="mt-2 block w-36 accent-primary" /></label>
        <button onClick={() => { setSeed((s) => s + 1); setRun(true); }} className="ml-auto flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"><Play className="h-4 w-4" />{tr({ uz: "O‘yinni boshlash", ru: "Начать матч", en: "Kick off" })}</button>
        <button onClick={() => { setSeed(Math.floor(Math.random() * 1e6)); setMinute(90); }} className="rounded-md border border-border p-2 text-foreground hover:bg-secondary" title="Random"><Shuffle className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-2">
          <Pitch>
            {ownR.zones.map((z) => z.opp !== z.own && <rect key={`${z.third}${z.channel}`} x={z.third * 35} y={z.channel * (68 / 3)} width={35} height={68 / 3} fill={z.own > z.opp ? "var(--zone)" : "var(--opponent)"} opacity={0.08 + Math.abs(z.own - z.opp) * 0.06} pointerEvents="none" />)}
            {ownR.zones.map((z) => <text key={"t" + z.third + z.channel} x={z.third * 35 + 17.5} y={z.channel * (68 / 3) + 3} textAnchor="middle" fontSize={2} fill="var(--pitch-line)" opacity={0.7}>{z.own} v {z.opp}</text>)}
            {own.map((p, i) => <Dot key={"o" + i} x={p[0]} y={p[1]} label={i + 1} tone={i === 0 ? "gk" : "own"} />)}
            {oppPts.map((p, i) => <Dot key={"r" + i} x={p[0]} y={p[1]} label={i + 1} tone="opp" />)}
          </Pitch>
          <p className="text-xs text-muted-foreground">{tr({ uz: "Yashil — son ustunligi sizda, qizil — raqibda.", ru: "Зелёный — численное преимущество у вас, красный — у соперника.", en: "Green — you outnumber the opponent, red — they outnumber you." })}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-xs uppercase text-muted-foreground">{minute}'</div>
            <div className="text-4xl font-extrabold"><span className="text-primary">{score.home}</span> : <span className="text-opponent">{score.away}</span></div>
            <div className="mt-1 text-xs text-muted-foreground">{tr({ uz: "To‘p nazorati", ru: "Владение", en: "Possession" })} {res.possession}% – {100 - res.possession}%</div>
          </div>
          <div className="grid grid-cols-2 gap-2">{[[tr({ uz: "Hujum", ru: "Атака", en: "Attack" }), ownR.attack], [tr({ uz: "Himoya", ru: "Оборона", en: "Defence" }), ownR.defence], [tr({ uz: "Kenglik", ru: "Ширина", en: "Width" }), Math.round(ownR.width) + "m"], [tr({ uz: "Chuqurlik", ru: "Глубина", en: "Depth" }), Math.round(ownR.depth) + "m"]].map(([k, v]) => <div key={k as string} className="rounded-lg border border-border bg-card p-2 text-center"><div className="text-lg font-extrabold">{v}</div><div className="text-[10px] uppercase text-muted-foreground">{k}</div></div>)}</div>
          <div className="rounded-xl border border-border bg-card p-3">
            <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{tr({ uz: "Zaif nuqtalar", ru: "Слабые места", en: "Weak spots" })}</h3>
            {ownR.weaknesses.length === 0 ? <p className="text-sm text-primary">{tr({ uz: "Jiddiy zaiflik topilmadi.", ru: "Серьёзных слабостей нет.", en: "No major weaknesses found." })}</p> : <ul className="flex flex-col gap-1 text-sm">{ownR.weaknesses.map((w) => <li key={w} className="rounded border-l-2 border-opponent bg-secondary px-2 py-1">{wText(w)}</li>)}</ul>}
          </div>
          <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-3">
            <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{tr({ uz: "O‘yin voqealari", ru: "События матча", en: "Match events" })}</h3>
            <ul className="flex flex-col gap-1 text-sm">{shown.slice().reverse().map((e, i) => <li key={i} className={cn("flex gap-2", e.kind === "goal" && "font-bold")}><span className="w-8 text-muted-foreground">{e.minute}'</span><span className={e.team === "home" ? "text-primary" : "text-opponent"}>{e.kind === "goal" ? "⚽ " + tr({ uz: "GOL!", ru: "ГОЛ!", en: "GOAL!" }) : tr({ uz: "Xavfli moment", ru: "Опасный момент", en: "Chance" })}</span></li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
