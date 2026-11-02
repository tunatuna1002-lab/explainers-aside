import type { ReactNode } from "react";
import { useGrokTheme } from "./hooks";
import { useLevel } from "./context";

/**
 * The card every chart sits in: the page's paper, a 1 px rule, a 16 px radius,
 * 20 px of padding. In a grid cell the cell is the card, so none is drawn.
 */
export function ChartCard({ children, label }: { children: ReactNode; label?: string }) {
  const t = useGrokTheme();
  const { inGrid } = useLevel();
  if (inGrid) return <div data-g="figure" aria-label={label}>{children}</div>;
  return (
    <div
      data-g="figure"
      role="figure"
      aria-label={label}
      style={{
        background: t.bg.base,
        border: `1px solid ${t.border.weak}`,
        borderRadius: t.radius.xl,
        padding: 20,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}
