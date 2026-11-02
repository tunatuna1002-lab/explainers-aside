export interface DAGLayoutOptions {
  nodes: Array<{ id: string }>;
  edges: Array<{ from: string; to: string }>;
  direction?: "vertical" | "horizontal";
  nodeWidth?: number;
  nodeHeight?: number;
  rankGap?: number;
  nodeGap?: number;
  padding?: number;
}
export interface DAGLayoutNode { id: string; x: number; y: number; rank: number; order: number }
export interface DAGLayoutEdge { from: string; to: string; sourceX: number; sourceY: number; targetX: number; targetY: number; isBackEdge: boolean }
export interface DAGLayoutRank { rank: number; x: number; y: number; width: number; height: number; nodeIds: string[] }
export interface DAGLayoutResult { nodes: DAGLayoutNode[]; edges: DAGLayoutEdge[]; ranks: DAGLayoutRank[]; direction: "vertical" | "horizontal"; width: number; height: number }

/** Back edges by DFS (in node order), ranks by longest path over the rest, order by first appearance. */
export function rankNodes(ids: string[], edges: Array<{ from: string; to: string }>) {
  const out = new Map<string, string[]>(ids.map((i) => [i, []]));
  edges.forEach((e) => out.get(e.from)?.push(e.to));
  const state = new Map<string, 0 | 1 | 2>();
  const back = new Set<string>();
  const visit = (u: string) => {
    state.set(u, 1);
    for (const v of out.get(u) ?? []) {
      const s = state.get(v) ?? 0;
      if (s === 1) back.add(`${u}->${v}`);
      else if (s === 0) visit(v);
    }
    state.set(u, 2);
  };
  ids.forEach((i) => { if (!state.get(i)) visit(i); });
  const fwd = edges.filter((e) => !back.has(`${e.from}->${e.to}`));
  const rank = new Map<string, number>(ids.map((i) => [i, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;
    for (const e of fwd) {
      const r = (rank.get(e.from) ?? 0) + 1;
      if (r > (rank.get(e.to) ?? 0)) { rank.set(e.to, r); changed = true; }
    }
    if (!changed) break;
  }
  return { rank, back };
}

export function computeDAGLayout(o: DAGLayoutOptions): DAGLayoutResult {
  const dir = o.direction ?? "vertical";
  const nw = o.nodeWidth ?? 160, nh = o.nodeHeight ?? 48, rg = o.rankGap ?? 48, ng = o.nodeGap ?? 24, pad = o.padding ?? 16;
  const ids = o.nodes.map((n) => n.id);
  const { rank, back } = rankNodes(ids, o.edges);
  const maxRank = Math.max(0, ...rank.values());
  const ranks: DAGLayoutRank[] = [];
  const pos = new Map<string, DAGLayoutNode>();
  const widest = Math.max(1, ...Array.from({ length: maxRank + 1 }, (_, r) => ids.filter((i) => rank.get(i) === r).length));
  const cross = widest * nw + (widest - 1) * ng;
  for (let r = 0; r <= maxRank; r++) {
    const inRank = ids.filter((i) => rank.get(i) === r);
    const span = inRank.length * nw + (inRank.length - 1) * ng;
    const start = pad + (cross - span) / 2;
    const along = pad + r * (nh + rg);
    inRank.forEach((id, k) => {
      const c = start + k * (nw + ng) + nw / 2;
      const node = dir === "vertical" ? { id, x: c, y: along + nh / 2, rank: r, order: k } : { id, x: along + nw / 2, y: c, rank: r, order: k };
      pos.set(id, node);
    });
    ranks.push(dir === "vertical" ? { rank: r, x: pad, y: along, width: cross, height: nh, nodeIds: inRank } : { rank: r, x: along, y: pad, width: nw, height: cross, nodeIds: inRank });
  }
  const edges = o.edges.filter((e) => pos.has(e.from) && pos.has(e.to)).map((e) => {
    const a = pos.get(e.from)!, b = pos.get(e.to)!;
    return { from: e.from, to: e.to, sourceX: a.x, sourceY: a.y, targetX: b.x, targetY: b.y, isBackEdge: back.has(`${e.from}->${e.to}`) };
  });
  const along = pad * 2 + (maxRank + 1) * (dir === "vertical" ? nh : nw) + maxRank * rg;
  return { nodes: [...pos.values()], edges, ranks, direction: dir, width: dir === "vertical" ? cross + pad * 2 : along, height: dir === "vertical" ? along : cross + pad * 2 };
}
