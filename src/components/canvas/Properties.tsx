import { Fragment, type ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";

export interface PropertyItem {
  label: string;
  value: ReactNode;
}

/** Key–value rows: a quiet label column of one width, the value beside it, no rules, no box. */
export function Properties({ items }: { items: readonly PropertyItem[] }) {
  const t = useGrokTheme();
  if (!items.length) return null;
  return (
    <dl
      className="g-props"
      style={{ ...textStyle(t.font.subtext), display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr)", columnGap: 24, rowGap: 8 }}
    >
      {items.map((it, i) => (
        <Fragment key={i}>
          <dt style={{ color: t.text.secondary, margin: 0 }}>{it.label}</dt>
          <dd style={{ color: t.text.primary, margin: 0 }}>{it.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
