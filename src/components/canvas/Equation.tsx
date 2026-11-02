import { Children, isValidElement, type ReactNode } from "react";
import katex from "katex";
import { useGrokTheme } from "./hooks";

export interface EquationProps { label?: string; children?: ReactNode }
export interface FracProps { num: ReactNode; den: ReactNode }
export interface PowProps { base: ReactNode; exp: ReactNode }
export interface SqrtProps { children?: ReactNode }
export interface ParenProps { open?: string; close?: string; children?: ReactNode }
export interface SumProps { from?: ReactNode; to?: ReactNode; sign?: string }

/*
 * The kit's math terms (Frac, Pow, Sqrt, Paren, Sum) are markers here: an
 * Equation turns its term tree into TeX and KaTeX typesets it at build time.
 * Used on their own, they fall back to the TeX of the one term.
 */
const ESC: Record<string, string> = { "\\": "\\backslash ", "{": "\\{", "}": "\\}", "#": "\\#", "$": "\\$", "%": "\\%", "&": "\\&", "~": "\\sim ", "^": "\\hat{}" };
const UNI: Record<string, string> = { "≈": "\\approx ", "×": "\\times ", "·": "\\cdot ", "−": "-", "≤": "\\le ", "≥": "\\ge ", "≠": "\\ne ", "√": "\\surd ", "…": "\\ldots ", "→": "\\to ", "∑": "\\sum ", "∏": "\\prod ", "∫": "\\int " };

function textToTex(s: string): string {
  // words of three or more letters with a lower-case letter are names (softmax, Attention): upright
  return s.replace(/[A-Za-z]*[a-z][A-Za-z]*|[\s\S]/g, (m) => {
    if (m.length >= 3) return `\\mathrm{${m}}`;
    if (m.length > 1) return m;
    if (/[가-힣]/.test(m)) return `\\text{${m}}`;
    return UNI[m] ?? ESC[m] ?? m;
  }).replace(/\s+/g, " ");
}

const DELIM: Record<string, string> = { "(": "(", ")": ")", "[": "[", "]": "]", "|": "|", "{": "\\{", "}": "\\}" };

export function toTex(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return textToTex(node);
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toTex).join(" ");
  if (isValidElement(node)) {
    const p = node.props as Record<string, ReactNode> & { children?: ReactNode };
    if (node.type === Frac) return `\\frac{${toTex(p.num)}}{${toTex(p.den)}}`;
    if (node.type === Pow) return `{${toTex(p.base)}}^{${toTex(p.exp)}}`;
    if (node.type === Sqrt) return `\\sqrt{${toTex(p.children)}}`;
    if (node.type === Paren) {
      const o = (p.open as string) ?? "(";
      const c = (p.close as string) ?? ")";
      return `\\left${DELIM[o] ?? "."}${toTex(p.children)}\\right${DELIM[c] ?? "."}`;
    }
    if (node.type === Sum) {
      const sign = (p.sign as string) ?? "∑";
      const op = sign === "∏" ? "\\prod" : sign === "∫" ? "\\int" : "\\sum";
      return `${op}${p.from ? `_{${toTex(p.from)}}` : ""}${p.to ? `^{${toTex(p.to)}}` : ""}`;
    }
    return Children.toArray(p.children).map(toTex).join(" ");
  }
  return "";
}

function Tex({ tex, display }: { tex: string; display: boolean }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "htmlAndMathml", strict: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** One equation on its own centered line, typeset by KaTeX, 16 px above and below. */
export function Equation({ label, children }: EquationProps) {
  const t = useGrokTheme();
  const terms = Children.toArray(children);
  if (!terms.length) return null;
  const tag = label ? `\\tag{${label.replace(/^\((.*)\)$/, "$1")}}` : "";
  const tex = terms.map(toTex).join(" ") + tag;
  return (
    <div className="g-equation" data-g="equation" style={{ color: t.text.primary }}>
      <Tex tex={tex} display />
    </div>
  );
}

export function Frac(props: FracProps) { return <Tex tex={toTex(<Frac {...props} />)} display={false} />; }
export function Pow(props: PowProps) { return <Tex tex={toTex(<Pow {...props} />)} display={false} />; }
export function Sqrt(props: SqrtProps) { return <Tex tex={toTex(<Sqrt {...props} />)} display={false} />; }
export function Paren(props: ParenProps) { return <Tex tex={toTex(<Paren {...props} />)} display={false} />; }
export function Sum(props: SumProps) { return <Tex tex={toTex(<Sum {...props} />)} display={false} />; }
