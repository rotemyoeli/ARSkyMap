/**
 * OrbitMark marker glyph — shape-first (colour only reinforces) with the signature
 * uncertainty ring that GROWS and FADES with `uncertainty` (0..1, from TLE age) — graded,
 * not a hard edge (grounded in SGP4 age-error + uncertainty-viz research). The live Tonight
 * screen is `screens.tsx#TonightView` (rendered by OrbitMarkApp); this file only exports Marker.
 */
import { type MarkerKind } from "./useOverhead";

export function Marker({ kind, watched = false, uncertainty = 0.35 }: { kind: MarkerKind; watched?: boolean; uncertainty?: number }) {
  const color = `var(--om-marker-${kind})`;
  const c = 18;
  const r = 11.5 + 4.5 * Math.max(0, Math.min(1, uncertainty)); // 11.5..16
  const op = 0.62 - 0.34 * Math.max(0, Math.min(1, uncertainty)); // fainter = less certain
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <circle className="om-ring" cx={c} cy={c} r={r} fill="none" stroke="var(--om-action-primary)" strokeOpacity={op} strokeWidth="1.4" strokeDasharray="3 4" />
      {watched && <circle cx={c} cy={c} r="16.5" fill="none" stroke="var(--om-success)" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="1 3" />}
      {kind === "active" && <circle cx={c} cy={c} r="6" fill={color} />}
      {kind === "inactive" && <rect x={c - 5.5} y={c - 5.5} width="11" height="11" rx="1.5" fill={color} />}
      {kind === "rocket" && <path d={`M${c} ${c - 7} L${c + 7} ${c} L${c} ${c + 7} L${c - 7} ${c} Z`} fill={color} />}
      {kind === "debris" && <path d={`M${c} ${c - 7} L${c + 6.5} ${c + 6} L${c - 6.5} ${c + 6} Z`} fill={color} />}
    </svg>
  );
}
