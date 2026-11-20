import { forwardRef, type ReactNode, type SVGProps } from "react";
// Plain 105x68 pitch with markings; children render on top in metre coordinates.
export const Pitch = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement> & { children?: ReactNode }>(function Pitch({ children, className, ...rest }, ref) {
  const line = { stroke: "var(--pitch-line)", strokeWidth: 0.25, fill: "none" };
  return (
    <svg ref={ref} viewBox="-3 -3 111 74" className={`block w-full touch-none select-none rounded-xl border border-border bg-pitch shadow-glow ${className ?? ""}`} {...rest}>
      {Array.from({ length: 11 }).map((_, i) => <rect key={i} x={i * 9.545} y={0} width={9.545} height={68} fill="var(--pitch-line)" opacity={i % 2 ? 0.02 : 0.045} />)}
      <g {...line} pointerEvents="none">
        <rect x={0} y={0} width={105} height={68} /><line x1={52.5} y1={0} x2={52.5} y2={68} />
        <circle cx={52.5} cy={34} r={9.15} />
        <rect x={0} y={13.84} width={16.5} height={40.32} /><rect x={88.5} y={13.84} width={16.5} height={40.32} />
        <rect x={0} y={24.84} width={5.5} height={18.32} /><rect x={99.5} y={24.84} width={5.5} height={18.32} />
        <rect x={-2} y={30.34} width={2} height={7.32} /><rect x={105} y={30.34} width={2} height={7.32} />
        <path d="M16.5 26.69 A9.15 9.15 0 0 1 16.5 41.31" /><path d="M88.5 26.69 A9.15 9.15 0 0 0 88.5 41.31" />
      </g>
      <defs>
        {(["run", "pass", "shot", "block"] as const).map((k) => <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={`var(--${k === "run" ? "run" : k === "pass" ? "pass" : k === "shot" ? "opponent" : "foreground"})`} /></marker>)}
      </defs>
      {children}
    </svg>
  );
});
export function Dot({ x, y, label, tone, onPointerDown, sub }: { x: number; y: number; label: string | number; tone: "own" | "opp" | "gk"; sub?: string | undefined; onPointerDown?: ((e: React.PointerEvent) => void) | undefined }) {
  const fill = tone === "opp" ? "var(--opponent)" : tone === "gk" ? "var(--warning)" : "var(--foreground)";
  return (
    <g className="player-node" style={{ transform: `translate(${x}px, ${y}px)` }} onPointerDown={onPointerDown} cursor={onPointerDown ? "grab" : undefined}>
      <circle r={2.2} fill={fill} stroke="var(--background)" strokeWidth={0.3} />
      <text y={0.8} textAnchor="middle" fontSize={2.1} fontWeight={800} fill="var(--background)">{label}</text>
      {sub && <text y={4.4} textAnchor="middle" fontSize={1.5} fontWeight={700} fill="var(--pitch-line)">{sub}</text>}
    </g>
  );
}
