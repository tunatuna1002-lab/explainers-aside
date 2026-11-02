import { isValidElement, type ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";
import { ScrollFade } from "./ScrollFade";
import type { Tone } from "./Callout";

export type TableCell = string | { text: string; tone?: Tone } | ReactNode;
export interface TableProps {
  columns: readonly string[];
  rows: readonly (readonly TableCell[])[];
  emphasis?: number;
  align?: readonly ("auto" | "start" | "end")[];
}

const FIGURE = /^[\s+\-−–]?[$€£₩]?[\d.,]+\s?[%xX×]?$|^[…\-–—]$/;
const isTone = (c: unknown): c is { text: string; tone?: Tone } =>
  !!c && typeof c === "object" && !isValidElement(c) && "text" in (c as object);
const cellText = (c: TableCell) => (typeof c === "string" ? c : isTone(c) ? c.text : null);

/**
 * A bordered grid: one 0.5 px outline with a rule between every cell, the
 * header a step smaller in medium weight, the first (label) column in
 * secondary ink, figures right-aligned in tabular numerals. Wider than the
 * page, it scrolls sideways and fades at the edge; from five columns every
 * label stays on one line.
 */
export function Table({ columns, rows, emphasis, align }: TableProps) {
  const t = useGrokTheme();
  const width = Math.max(columns.length, ...rows.map((r) => r.length));
  const cols = Array.from({ length: width }, (_, i) => i);
  const nowrap = width >= 5;
  const autoAlign = cols.map((c) => {
    const texts = rows.map((r) => (r[c] === undefined ? null : cellText(r[c] as TableCell)));
    const nonEmpty = texts.filter((x) => x !== null && x !== "") as string[];
    const figures = nonEmpty.length > 0 && nonEmpty.every((x) => FIGURE.test(x.trim())) && nonEmpty.some((x) => /\d/.test(x));
    return figures ? "end" : "start";
  });
  const alignOf = (c: number) => {
    const a = align?.[c] ?? "auto";
    return a === "auto" ? (c === 0 ? "start" : autoAlign[c]) : a;
  };
  const line = `0.5px solid ${t.border.strong}`;
  const toneColor = (tone?: Tone) => (tone ? t.text[tone] : undefined);
  return (
    <div data-g="figure">
      <ScrollFade>
        <table
          className="g-table"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%",
            border: line,
            borderRadius: t.radius.md,
            ...textStyle(t.font.table),
            whiteSpace: nowrap ? "nowrap" : undefined,
          }}
        >
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  scope="col"
                  style={{
                    ...textStyle(t.font.subtext),
                    fontWeight: t.weight.medium,
                    color: t.text.secondary,
                    textAlign: alignOf(c) === "end" ? "right" : "left",
                    padding: "10px 14px",
                    borderLeft: c ? line : undefined,
                    verticalAlign: "bottom",
                  }}
                >
                  {columns[c] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {cols.map((c) => {
                  const cell = r[c];
                  const Tag = c === 0 ? "th" : "td";
                  const content = isTone(cell) ? <span style={{ color: toneColor(cell.tone) }}>{cell.text}</span> : (cell as ReactNode);
                  return (
                    <Tag
                      key={c}
                      scope={c === 0 ? "row" : undefined}
                      style={{
                        fontWeight: c === emphasis ? t.weight.medium : t.weight.regular,
                        color: c === 0 ? t.text.secondary : t.text.primary,
                        textAlign: alignOf(c) === "end" ? "right" : "left",
                        fontVariantNumeric: "tabular-nums",
                        padding: "10px 14px",
                        borderTop: line,
                        borderLeft: c ? line : undefined,
                        verticalAlign: "top",
                      }}
                    >
                      {content ?? ""}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollFade>
    </div>
  );
}
