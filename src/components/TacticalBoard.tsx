import { useRef, useState } from "react";
import type { Player, PhaseData } from "@/lib/tactics";

export type Tool = "move" | "paint" | "erase";
type Props = {
  data: PhaseData; players: Player[]; selected: string | null; tool: Tool; brush: number; intensity: number;
  showGrid: boolean; snap: boolean; showAll: boolean;
  onSelect: (id: string | null) => void; onMove: (id: string, p: [number, number]) => void;
  onZones: (id: string, z: Record<string, number>) => void; onCommit: () => void;
};

export function TacticalBoard(p: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [painting, setPainting] = useState(false);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const toPitch = (e: React.PointerEvent): [number, number] => {
    const s = svg.current!; const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const r = pt.matrixTransform(s.getScreenCTM()!.inverse());
    return [Math.max(0, Math.min(105, r.x)), Math.max(0, Math.min(68, r.y))];
  };
  const paintAt = (pos: [number, number]) => {
    if (!p.selected) return;
    const z = { ...(p.data.zones[p.selected] || {}) }; const r = p.brush - 1;
    const cx = Math.floor(pos[0]), cy = Math.floor(pos[1]);
    for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) {
      if (x < 0 || y < 0 || x >= 105 || y >= 68 || (x - cx) ** 2 + (y - cy) ** 2 > r * r + 0.5) continue;
      const k = `${x},${y}`; if (p.tool === "erase" || p.intensity === 0) delete z[k]; else z[k] = p.intensity;
    }
    p.onZones(p.selected, z);
  };
  const onDown = (e: React.PointerEvent) => {
    if (p.tool === "move") return;
    (e.target as Element).setPointerCapture?.(e.pointerId); setPainting(true); paintAt(toPitch(e));
  };
  const onMoveEv = (e: React.PointerEvent) => {
    const pos = toPitch(e); setHover(pos);
    if (drag) p.onMove(drag, p.snap ? [Math.round(pos[0]), Math.round(pos[1])] : [+pos[0].toFixed(1), +pos[1].toFixed(1)]);
    else if (painting) paintAt(pos);
  };
  const onUp = () => { if (drag || painting) p.onCommit(); setDrag(null); setPainting(false); };
  const zoneIds = p.showAll ? Object.keys(p.data.zones) : p.selected ? [p.selected] : [];
  const line = { stroke: "var(--pitch-line)", strokeWidth: 0.25, fill: "none" };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border shadow-glow">
      <svg ref={svg} viewBox="-3 -3 111 74" className={`block w-full touch-none select-none bg-pitch ${p.tool !== "move" ? "cursor-crosshair" : ""}`}
        onPointerDown={onDown} onPointerMove={onMoveEv} onPointerUp={onUp} onPointerLeave={() => { onUp(); setHover(null); }}>
        {Array.from({ length: 11 }).map((_, i) => <rect key={i} x={i * 9.545} y={0} width={9.545} height={68} fill="var(--pitch-line)" opacity={i % 2 ? 0.02 : 0.045} />)}
        {zoneIds.map((id) => Object.entries(p.data.zones[id] || {}).map(([k, v]) => {
          const [x, y] = k.split(",").map(Number);
          return <rect key={id + k} x={x} y={y} width={1.02} height={1.02} fill="var(--zone)" opacity={(v / 100) * (p.showAll && id !== p.selected ? 0.35 : 0.85)} pointerEvents="none" />;
        }))}
        {p.showGrid && <g stroke="var(--pitch-line)" strokeWidth={0.04} opacity={0.35} pointerEvents="none">
          {Array.from({ length: 106 }).map((_, i) => <line key={"x" + i} x1={i} y1={0} x2={i} y2={68} strokeWidth={i % 5 ? 0.03 : 0.08} />)}
          {Array.from({ length: 69 }).map((_, i) => <line key={"y" + i} x1={0} y1={i} x2={105} y2={i} strokeWidth={i % 5 ? 0.03 : 0.08} />)}
        </g>}
        <g {...line} pointerEvents="none">
          <rect x={0} y={0} width={105} height={68} />
          <line x1={52.5} y1={0} x2={52.5} y2={68} />
          <circle cx={52.5} cy={34} r={9.15} /><circle cx={52.5} cy={34} r={0.4} fill="var(--pitch-line)" />
          <rect x={0} y={13.84} width={16.5} height={40.32} /><rect x={88.5} y={13.84} width={16.5} height={40.32} />
          <rect x={0} y={24.84} width={5.5} height={18.32} /><rect x={99.5} y={24.84} width={5.5} height={18.32} />
          <rect x={-2} y={30.34} width={2} height={7.32} /><rect x={105} y={30.34} width={2} height={7.32} />
          <circle cx={11} cy={34} r={0.4} fill="var(--pitch-line)" /><circle cx={94} cy={34} r={0.4} fill="var(--pitch-line)" />
          <path d="M16.5 26.69 A9.15 9.15 0 0 1 16.5 41.31" /><path d="M88.5 26.69 A9.15 9.15 0 0 0 88.5 41.31" />
          <path d="M1 0 A1 1 0 0 1 0 1" /><path d="M0 67 A1 1 0 0 1 1 68" /><path d="M104 0 A1 1 0 0 0 105 1" /><path d="M105 67 A1 1 0 0 0 104 68" />
        </g>
        {p.players.map((pl) => {
          const pos = p.data.pos[pl.id]; if (!pos) return null; const sel = pl.id === p.selected;
          return (
            <g key={pl.id} className={`player-node ${drag === pl.id ? "dragging" : ""}`} style={{ transform: `translate(${pos[0]}px, ${pos[1]}px)` }}
              onPointerDown={(e) => { p.onSelect(pl.id); if (p.tool === "move") { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(pl.id); } }}
              cursor={p.tool === "move" ? "grab" : undefined}>
              {sel && <circle r={3.2} fill="none" stroke="var(--primary)" strokeWidth={0.35} />}
              <circle r={2.3} fill={pl.position === "GK" ? "var(--warning)" : sel ? "var(--primary)" : "var(--foreground)"} stroke="var(--background)" strokeWidth={0.3} />
              <text y={0.85} textAnchor="middle" fontSize={2.3} fontWeight={800} fill="var(--background)">{pl.number}</text>
              <text y={4.6} textAnchor="middle" fontSize={1.6} fontWeight={700} fill="var(--pitch-line)">{pl.name || pl.position}{pl.captain ? " ©" : ""}</text>
            </g>
          );
        })}
      </svg>
      {hover && <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">{hover[0].toFixed(1)}m × {hover[1].toFixed(1)}m</div>}
    </div>
  );
}
