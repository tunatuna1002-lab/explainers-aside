import { Children, type ReactNode } from "react";
import { useGrokTheme } from "./hooks";
import { LevelContext, useLevel } from "./context";

export type GridColumns = 2 | 3 | 4 | 5 | 6 | 7;
export interface GridProps {
  columns?: GridColumns;
  joined?: boolean;
  plain?: boolean;
  children?: ReactNode;
}

/** Two to seven blocks side by side, each cell a card; cells wrap on a narrow page. */
export function Grid({ columns = 2, joined, plain, children }: GridProps) {
  const t = useGrokTheme();
  const level = useLevel();
  const cells = Children.toArray(children);
  if (!cells.length) return null;
  const cellStyle = plain
    ? {}
    : joined
      ? { padding: 20 }
      : { border: `1px solid ${t.border.weak}`, borderRadius: t.radius.xl, padding: 20, background: t.bg.base };
  return (
    <div
      data-g="figure"
      className="g-grid"
      data-joined={joined || undefined}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(220px, calc((100% - ${(columns - 1) * 16}px) / ${columns}))), 1fr))`,
        gap: joined ? 0 : 16,
        alignItems: "start",
        ...(joined ? { border: `1px solid ${t.border.weak}`, borderRadius: t.radius.xl, overflow: "hidden" } : {}),
      }}
    >
      {cells.map((c, i) => (
        <LevelContext.Provider key={i} value={{ depth: level.depth, inGrid: true }}>
          <div className="g-cell" style={{ ...cellStyle, minWidth: 0 }}>{c}</div>
        </LevelContext.Provider>
      ))}
    </div>
  );
}

export interface Metric { value: string; label: string; detail?: string; tone?: "success" | "warning" | "danger" }
/** A strip of headline figures, no cards. */
export function Metrics({ metrics }: { metrics: readonly Metric[] }) {
  const t = useGrokTheme();
  return (
    <div data-g="figure" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, gap: 24 }}>
      {metrics.map((m, i) => (
        <div key={i}>
          <div style={{ fontSize: t.font.metric.fontSize, lineHeight: t.font.metric.lineHeight, fontWeight: t.weight.medium, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
          <div style={{ fontSize: t.font.subtext.fontSize, lineHeight: t.font.subtext.lineHeight, color: t.text.secondary }}>{m.label}</div>
          {m.detail ? <div style={{ fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, color: m.tone ? t.text[m.tone] : t.text.tertiary }}>{m.detail}</div> : null}
        </div>
      ))}
    </div>
  );
}
