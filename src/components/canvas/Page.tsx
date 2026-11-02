import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";
import { LevelContext, PageContext, slugify, strings } from "./context";
import { Section, type SectionProps } from "./Section";
import { TableOfContents } from "./TableOfContents";
import type { PageWidth } from "./width";

export interface PageProps {
  title: string;
  summary?: string;
  /** @deprecated renders nothing, as in the kit */
  sources?: readonly string[];
  width?: PageWidth;
  /** Language of the page (sets kit chrome strings); the site's <html lang> is set by the layout. */
  lang?: string;
  children?: ReactNode;
}

/**
 * Root of a page: title, TL;DR box (the summary), then numbered sections.
 * Layout follows qlabs: the TableOfContents moves into a sticky left rail on
 * a wide screen and sits above the sections on a narrow one.
 */
export function Page({ title, summary, width = "column", lang = "ko", children }: PageProps) {
  const t = useGrokTheme();
  const s = strings(lang);
  const all = Children.toArray(children);
  let toc: ReactElement | null = null;
  const body: ReactNode[] = [];
  const numbers: Record<string, string> = {};
  let n = 0;
  for (const child of all) {
    if (isValidElement(child) && child.type === TableOfContents && !toc) {
      toc = child;
      continue;
    }
    if (isValidElement(child) && child.type === Section) {
      const p = child.props as SectionProps;
      if (p.heading) {
        n += 1;
        const id = p.id ?? slugify(p.heading);
        numbers[id] = String(n);
        body.push(
          <LevelContext.Provider key={child.key ?? id} value={{ depth: 0, inGrid: false, number: String(n) }}>
            {child}
          </LevelContext.Provider>,
        );
        continue;
      }
    }
    body.push(child);
  }

  return (
    <PageContext.Provider value={{ lang, hasSummary: !!summary, numbers }}>
      <div className="g-page" data-width={width} lang={lang} style={{ fontFamily: t.font.family, color: t.text.primary }}>
        <header className="g-header">
          <h1 style={{ ...textStyle(t.font.heading1), fontWeight: 700, margin: 0, textWrap: "balance" }}>{title}</h1>
          {summary ? (
            <section id="tldr" className="g-tldr" style={{ background: t.fill.secondary, borderRadius: t.radius.lg }}>
              <h2
                style={{
                  ...textStyle(t.font.label),
                  fontWeight: t.weight.semibold,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: t.text.secondary,
                  margin: "0 0 8px",
                }}
              >
                {s.tldr}
              </h2>
              <p style={{ ...textStyle(t.font.body1), margin: 0 }}>{summary}</p>
            </section>
          ) : null}
        </header>
        {toc ? <aside className="g-outline">{toc}</aside> : null}
        <main className="g-main">{body}</main>
      </div>
    </PageContext.Provider>
  );
}
