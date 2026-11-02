import { useGrokTheme, textStyle } from "./hooks";
import { ChartCard } from "./ChartCard";

export interface Bar {
  label: string;
  value: number;
  display: string;
  meta?: string;
}
export interface BarsProps {
  bars: readonly Bar[];
  emphasis?: number | "none";
}

/** Horizontal bars, one 6 px track per row; label column up to two fifths of the block. */
export function Bars({ bars, emphasis }: BarsProps) {
  const t = useGrokTheme();
  if (!bars.length) return null;
  const finite = bars.map((b) => (Number.isFinite(b.value) ? Math.abs(b.value) : 0));
  const max = Math.max(...finite) || 1;
  const emph = emphasis ?? finite.indexOf(Math.max(...finite));
  return (
    <ChartCard>
      <div
        className="g-bars"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, max-content) minmax(32px, 1fr) max-content",
          columnGap: 12,
          rowGap: 12,
          alignItems: "center",
          ...textStyle(t.font.body2),
        }}
      >
        {bars.map((b, i) => {
          const full = emph === "none" || emph === i;
          const color = b.value < 0 ? t.dataviz.negative : full ? t.dataviz.categorical[0] : t.dataviz.singleSeriesRest;
          const pct = Number.isFinite(b.value) ? (Math.abs(b.value) / max) * 100 : 0;
          return (
            <div key={i} style={{ display: "contents" }}>
              <span className="g-bars-label" style={{ color: t.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.label}>
                {b.label}
              </span>
              <span style={{ position: "relative", height: 6, borderRadius: 3, background: t.fill.secondary, overflow: "hidden" }}>
                <span style={{ position: "absolute", inset: 0, width: `${pct}%`, background: color, borderRadius: 3 }} />
              </span>
              <span style={{ color: t.text.primary, fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" }}>
                {Number.isFinite(b.value) ? b.display : "–"}
                {b.meta ? <span style={{ color: t.text.tertiary, marginLeft: 6 }}>{b.meta}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
