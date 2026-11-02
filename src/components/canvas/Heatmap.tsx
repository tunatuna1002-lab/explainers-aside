import { useGrokTheme, textStyle } from "./hooks";
import { ChartCard } from "./ChartCard";
import { ScrollFade } from "./ScrollFade";
import { strings, usePage } from "./context";

export interface HeatmapProps {
  rows: readonly string[];
  columns: readonly string[];
  values: readonly number[][];
  max?: number;
}

/**
 * A matrix heatmap in a chart card: row labels down the left, column labels
 * across the top, 27 px tall cells on the blue ramp. Cells share the block's
 * width up to 54 px each and never go under 12 px; below that the matrix
 * scrolls sideways with a fading edge. A scale above reads Fewer → More.
 */
export function Heatmap({ rows, columns, values, max }: HeatmapProps) {
  const t = useGrokTheme();
  const s = strings(usePage().lang);
  if (!rows.length || !columns.length) return null;
  const flat = values.flat().filter((v) => Number.isFinite(v) && v > 0);
  const top = max ?? (flat.length ? Math.max(...flat) : 1);
  const ramp = t.dataviz.sequential;
  const colorOf = (v: number | undefined) => {
    if (v === undefined || !Number.isFinite(v) || v <= 0) return t.fill.secondary;
    const k = Math.min(ramp.length - 1, Math.max(0, Math.ceil((v / top) * ramp.length) - 1));
    return ramp[k];
  };
  const n = columns.length;
  return (
    <ChartCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12, ...textStyle(t.font.label), color: t.text.tertiary }}>
        <span>{s.fewer}</span>
        <span style={{ display: "flex", gap: 2 }} aria-hidden>
          {ramp.map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
          ))}
        </span>
        <span>{s.more}</span>
      </div>
      <ScrollFade>
        <div
          className="g-heatmap"
          role="table"
          style={{
            display: "grid",
            gridTemplateColumns: `max-content repeat(${n}, minmax(12px, 54px))`,
            gap: 2,
            minWidth: `calc(${n} * 12px + 48px)`,
            ...textStyle(t.font.label),
          }}
        >
          <span role="columnheader" />
          {columns.map((c, i) => (
            <span key={i} role="columnheader" style={{ color: t.text.secondary, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip", paddingBottom: 4 }}>
              {c}
            </span>
          ))}
          {rows.map((r, ri) => (
            <div key={ri} role="row" style={{ display: "contents" }}>
              <span role="rowheader" style={{ color: t.text.secondary, whiteSpace: "nowrap", paddingRight: 8, alignSelf: "center" }}>
                {r}
              </span>
              {columns.map((_, ci) => {
                const v = values[ri]?.[ci];
                return (
                  <span
                    key={ci}
                    role="cell"
                    title={`${r} → ${columns[ci]}: ${v ?? "–"}`}
                    aria-label={`${r}, ${columns[ci]}: ${v ?? "–"}`}
                    style={{ height: 27, borderRadius: 4, background: colorOf(v) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </ScrollFade>
    </ChartCard>
  );
}
