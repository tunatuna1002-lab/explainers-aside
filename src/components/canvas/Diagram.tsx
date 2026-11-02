import { useEffect, useRef, useState, type ReactElement } from "react";
import { useGrokTheme } from "./hooks";
import { ChartCard } from "./ChartCard";
import { ScrollFade } from "./ScrollFade";
import { rankNodes } from "./dag";

export type DiagramNodeKind = "box" | "decision" | "terminal" | "person";
export interface DiagramNode { id: string; label: string; detail?: string; kind?: DiagramNodeKind; avatar?: string; series?: number }
export interface DiagramEdge { from: string; to: string; label?: string; detail?: string; dashed?: boolean }
export interface DiagramProps { nodes: DiagramNode[]; edges: DiagramEdge[]; direction?: "horizontal" | "vertical" }

/** Rough text width for layout (no DOM at build time): Hangul a full em, Latin narrower. */
function textWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) {
    if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u4e00-\u9fff]/.test(ch)) w += 1.0;
    else if (ch === " ") w += 0.3;
    else if (/[A-Z0-9]/.test(ch)) w += 0.64;
    else if (/[a-z]/.test(ch)) w += 0.54;
    else w += 0.42;
  }
  return Math.ceil(w * size);
}

interface Placed extends DiagramNode { x: number; y: number; w: number; h: number; rank: number }

const CLEAR = 8; // line clearance from a node face
const LABEL_GAP = 8;

/**
 * A flowchart / relationship diagram in a chart card: bordered node cards
 * (a `box` with detail has an accent bar), `terminal` pills, `decision`
 * diamonds, tertiary-ink 1.5 px lines with open chevron heads, back edges
 * (a "No" loop) leaving the side of their node in a lane beside the column.
 * Never scaled down: wider than its block it scrolls sideways, fading at the edge.
 */
export function Diagram({ nodes: rawNodes, edges: rawEdges, direction = "vertical" }: DiagramProps) {
  const t = useGrokTheme();
  const box = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el);
    setAvail(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const seen = new Set<string>();
  const nodes = rawNodes.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  if (!nodes.length) return null;
  const ids = nodes.map((n) => n.id);
  const edges = rawEdges.filter((e) => e.from !== e.to && seen.has(e.from) && seen.has(e.to));
  const { rank, back } = rankNodes(ids, edges);

  const LABEL = 13, DETAIL = 12;
  const boxW = Math.max(
    200,
    ...nodes.filter((n) => (n.kind ?? "box") === "box").map((n) => Math.max(textWidth(n.label, LABEL), n.detail ? textWidth(n.detail, DETAIL) : 0) + 44),
  );
  const size = (n: DiagramNode) => {
    const k = n.kind ?? "box";
    if (k === "decision") { const w = Math.max(150, textWidth(n.label, LABEL) + 80); return { w, h: 76 }; }
    if (k === "terminal") { const w = Math.max(textWidth(n.label, LABEL), n.detail ? textWidth(n.detail, DETAIL) : 0) + 48; return { w, h: n.detail ? 52 : 36 }; }
    if (k === "person") return { w: boxW, h: 52 };
    return { w: boxW, h: n.detail ? 52 : 36 };
  };

  const vertical = direction === "vertical";
  const maxRank = Math.max(0, ...rank.values());
  const PAD = 4;
  const rankGapBase = 32;
  const placed = new Map<string, Placed>();
  // rank extents
  const rankNodesList = Array.from({ length: maxRank + 1 }, (_, r) => nodes.filter((n) => rank.get(n.id) === r));
  const rankThick = rankNodesList.map((ns) => Math.max(0, ...ns.map((n) => (vertical ? size(n).h : size(n).w))));
  const rankSpan = rankNodesList.map((ns) => ns.reduce((s, n) => s + (vertical ? size(n).w : size(n).h), 0) + Math.max(0, ns.length - 1) * 24);
  const cross = Math.max(...rankSpan);
  // a labelled forward edge into a rank needs room for the label beside the line
  let along = PAD;
  rankNodesList.forEach((ns, r) => {
    let start = PAD + (cross - rankSpan[r]) / 2;
    ns.forEach((n) => {
      const s = size(n);
      const c = start + (vertical ? s.w : s.h) / 2;
      start += (vertical ? s.w : s.h) + 24;
      const a = along + rankThick[r] / 2;
      placed.set(n.id, { ...n, ...s, rank: r, x: vertical ? c : a, y: vertical ? a : c });
    });
    along += rankThick[r] + rankGapBase;
  });
  const alongEnd = along - rankGapBase + PAD;

  // back edges run in lanes beside the column
  const backEdges = edges.filter((e) => back.has(`${e.from}->${e.to}`));
  const rightmost = Math.max(...[...placed.values()].map((p) => (vertical ? p.x + p.w / 2 : p.y + p.h / 2)));
  const laneOf = (i: number) => rightmost + 28 + i * 18;
  const backLabelW = Math.max(0, ...backEdges.map((e) => Math.max(e.label ? textWidth(e.label, 12) : 0, e.detail ? textWidth(e.detail, 11) : 0)));
  const fwdLabelW = Math.max(0, ...edges.filter((e) => !back.has(`${e.from}->${e.to}`)).map((e) => (e.label ? textWidth(e.label, 12) : 0)));
  const wideEnd = Math.max(PAD + cross + PAD + fwdLabelW / 2, backEdges.length ? laneOf(backEdges.length - 1) + LABEL_GAP + backLabelW + PAD : 0);
  // On a narrow block a back-edge label turns to run along its lane, so the drawing keeps its nodes and lines in view.
  const compactEnd = Math.max(PAD + cross + PAD + fwdLabelW / 2, backEdges.length ? laneOf(backEdges.length - 1) + LABEL_GAP + 16 + PAD : 0);
  const compact = vertical && backEdges.length > 0 && avail !== null && wideEnd > avail;
  const crossEnd = compact ? compactEnd : wideEnd;
  const W = Math.ceil(vertical ? crossEnd : alongEnd);
  const H = Math.ceil(vertical ? alongEnd : crossEnd);

  const ink = t.text.tertiary;
  const font = t.font.family;
  const head = (x: number, y: number, dir: "down" | "up" | "left" | "right") => {
    const s = 5;
    const d = { down: `M${x - s} ${y - s}L${x} ${y}L${x + s} ${y - s}`, up: `M${x - s} ${y + s}L${x} ${y}L${x + s} ${y + s}`, left: `M${x + s} ${y - s}L${x} ${y}L${x + s} ${y + s}`, right: `M${x - s} ${y - s}L${x} ${y}L${x - s} ${y + s}` }[dir];
    return <path d={d} fill="none" stroke={ink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const faceBottom = (p: Placed) => p.y + p.h / 2;
  const faceTop = (p: Placed) => p.y - p.h / 2;
  const faceRight = (p: Placed) => p.x + p.w / 2;

  const lines: ReactElement[] = [];
  edges.forEach((e, i) => {
    const a = placed.get(e.from)!, b = placed.get(e.to)!;
    const dash = e.dashed ? "5 4" : undefined;
    const isBack = back.has(`${e.from}->${e.to}`);
    if (vertical && isBack) {
      const lane = laneOf(backEdges.indexOf(e));
      const x1 = faceRight(a) + CLEAR, y1 = a.y;
      const x2 = faceRight(b) + CLEAR, y2 = b.y;
      const r = 8;
      const d = `M${x1} ${y1}H${lane - r}Q${lane} ${y1} ${lane} ${y1 - r}V${y2 + r}Q${lane} ${y2} ${lane - r} ${y2}H${x2}`;
      const my = (y1 + y2) / 2;
      lines.push(
        <g key={`e${i}`}>
          <path d={d} fill="none" stroke={ink} strokeWidth={1.5} strokeDasharray={dash} strokeLinejoin="round" />
          {head(x2, y2, "left")}
          {e.label && compact ? (
            <text x={lane + LABEL_GAP + 6} y={my} transform={`rotate(90 ${lane + LABEL_GAP + 6} ${my})`} textAnchor="middle" fontSize={12} fill={t.text.secondary} fontFamily={font} dominantBaseline="middle">{e.label}</text>
          ) : null}
          {e.label && !compact ? <text x={lane + LABEL_GAP} y={my} fontSize={12} fill={t.text.secondary} fontFamily={font} dominantBaseline="middle">{e.label}</text> : null}
          {e.detail && !compact ? <text x={lane + LABEL_GAP} y={my + 16} fontSize={11} fill={t.text.tertiary} fontFamily={font} dominantBaseline="middle">{e.detail}</text> : null}
        </g>,
      );
      return;
    }
    if (vertical) {
      const x1 = a.x, y1 = faceBottom(a) + CLEAR, x2 = b.x, y2 = faceTop(b) - CLEAR;
      const midY = (y1 + y2) / 2;
      const d = x1 === x2 ? `M${x1} ${y1}V${y2}` : `M${x1} ${y1}V${midY}H${x2}V${y2}`;
      lines.push(
        <g key={`e${i}`}>
          <path d={d} fill="none" stroke={ink} strokeWidth={1.5} strokeDasharray={dash} strokeLinejoin="round" />
          {head(x2, y2, "down")}
          {e.label ? <text x={x2 + LABEL_GAP} y={(midY + y2) / 2 - 2} fontSize={12} fill={t.text.secondary} fontFamily={font} dominantBaseline="middle">{e.label}</text> : null}
        </g>,
      );
      return;
    }
    // horizontal
    const x1 = a.x + a.w / 2 + CLEAR, y1 = a.y, x2 = b.x - b.w / 2 - CLEAR, y2 = b.y;
    const midX = (x1 + x2) / 2;
    const d = y1 === y2 ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}H${midX}V${y2}H${x2}`;
    lines.push(
      <g key={`e${i}`}>
        <path d={d} fill="none" stroke={ink} strokeWidth={1.5} strokeDasharray={dash} />
        {head(x2, y2, "right")}
        {e.label ? <text x={midX} y={Math.min(y1, y2) - LABEL_GAP} fontSize={12} fill={t.text.secondary} fontFamily={font} textAnchor="middle">{e.label}</text> : null}
      </g>,
    );
  });

  const nodeEls = [...placed.values()].map((p) => {
    const k = p.kind ?? "box";
    const left = p.x - p.w / 2, topY = p.y - p.h / 2;
    const stroke = t.border.default;
    if (k === "decision") {
      return (
        <g key={p.id}>
          <path d={`M${p.x} ${topY}L${p.x + p.w / 2} ${p.y}L${p.x} ${topY + p.h}L${left} ${p.y}Z`} fill={t.bg.base} stroke={stroke} strokeWidth={1} strokeLinejoin="round" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={LABEL} fontWeight={t.weight.medium} fill={t.text.primary} fontFamily={font}>{p.label}</text>
        </g>
      );
    }
    if (k === "terminal") {
      return (
        <g key={p.id}>
          <rect x={left + 0.5} y={topY + 0.5} width={p.w - 1} height={p.h - 1} rx={p.h / 2} fill={t.bg.base} stroke={stroke} />
          <text x={p.x} y={p.detail ? p.y - 8 : p.y} textAnchor="middle" dominantBaseline="central" fontSize={LABEL} fontWeight={t.weight.medium} fill={t.text.primary} fontFamily={font}>{p.label}</text>
          {p.detail ? <text x={p.x} y={p.y + 9} textAnchor="middle" dominantBaseline="central" fontSize={DETAIL} fill={t.text.secondary} fontFamily={font}>{p.detail}</text> : null}
        </g>
      );
    }
    const bar = p.series !== undefined && p.series < 3 ? t.dataviz.categorical[p.series] : t.dataviz.other;
    return (
      <g key={p.id}>
        <rect x={left + 0.5} y={topY + 0.5} width={p.w - 1} height={p.h - 1} rx={t.radius.md} fill={t.bg.base} stroke={stroke} />
        {p.detail || p.series !== undefined ? (
          <>
            <rect x={left + 8} y={topY + 8} width={3} height={p.h - 16} rx={1.5} fill={bar} />
            <text x={left + 21} y={p.detail ? p.y - 8 : p.y} dominantBaseline="central" fontSize={LABEL} fontWeight={t.weight.medium} fill={t.text.primary} fontFamily={font}>{p.label}</text>
            {p.detail ? <text x={left + 21} y={p.y + 9} dominantBaseline="central" fontSize={DETAIL} fill={t.text.secondary} fontFamily={font}>{p.detail}</text> : null}
          </>
        ) : (
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={LABEL} fontWeight={t.weight.medium} fill={t.text.primary} fontFamily={font}>{p.label}</text>
        )}
      </g>
    );
  });

  const desc = nodes.map((n) => n.label + (n.detail ? ` (${n.detail})` : "")).join(" → ");
  return (
    <ChartCard>
      <div ref={box}>
      <ScrollFade style={{ paddingBottom: 4 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={desc} style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
          {lines}
          {nodeEls}
        </svg>
      </ScrollFade>
      </div>
    </ChartCard>
  );
}
