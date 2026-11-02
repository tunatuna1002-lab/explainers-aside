import type { ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";

export interface Step {
  title: ReactNode;
  detail?: ReactNode;
}

/** A procedure: each step a circled number on a rail, a bold title, a quiet line of detail. */
export function Steps({ steps }: { steps: readonly Step[] }) {
  const t = useGrokTheme();
  if (!steps.length) return null;
  return (
    <ol data-g="list" className="g-steps" style={{ listStyle: "none", padding: 0 }}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr)", columnGap: 12 }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                aria-hidden
                style={{
                  ...textStyle(t.font.label),
                  width: 24,
                  height: 24,
                  borderRadius: t.radius.full,
                  border: `1px solid ${t.border.strong}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: t.weight.medium,
                  fontVariantNumeric: "tabular-nums",
                  color: t.text.primary,
                  background: t.bg.base,
                  flex: "none",
                }}
              >
                {i + 1}
              </span>
              {!last ? <span aria-hidden style={{ width: 1, flex: "1 1 auto", background: t.border.default, margin: "4px 0" }} /> : null}
            </div>
            <div style={{ paddingBottom: last ? 0 : 20, paddingTop: 1 }}>
              <div style={{ ...textStyle(t.font.body1), fontWeight: t.weight.semibold, color: t.text.primary }}>{s.title}</div>
              {s.detail ? <div className="g-text" style={{ ...textStyle(t.font.subtext), color: t.text.secondary, marginTop: 2 }}>{s.detail}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export type ListItem = string | { text: ReactNode; items?: readonly ListItem[]; bullets?: boolean };
function Items({ items, ordered }: { items: readonly ListItem[]; ordered: boolean }) {
  const t = useGrokTheme();
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={{ ...textStyle(t.font.body1), margin: 0, paddingLeft: 24 }}>
      {items.map((it, i) => (
        <li key={i} style={{ marginTop: i ? 8 : 0 }}>
          {typeof it === "string" ? it : it.text}
          {typeof it !== "string" && it.items ? <Items items={it.items} ordered={ordered && !it.bullets} /> : null}
        </li>
      ))}
    </Tag>
  );
}
export function BulletList({ items }: { items: readonly ListItem[]; marker?: "pro" | "con" }) {
  return <div data-g="list"><Items items={items} ordered={false} /></div>;
}
export function NumberedList({ items }: { items: readonly ListItem[] }) {
  return <div data-g="list"><Items items={items} ordered /></div>;
}
