import { useEffect, useState } from "react";
import { useGrokTheme, textStyle } from "./hooks";
import { slugify, strings, usePage } from "./context";

export interface TableOfContentsItem {
  label: string;
  id?: string;
  depth?: number;
}
export interface TableOfContentsProps {
  items: readonly TableOfContentsItem[];
  title?: string;
}

/**
 * The page's outline. Inside a Page it is moved into the sticky left rail
 * (wide screens) or sits above the sections (narrow screens, a quiet bordered
 * box). The entry of the section the reader is in is set in medium weight.
 */
export function TableOfContents({ items, title }: TableOfContentsProps) {
  const t = useGrokTheme();
  const page = usePage();
  const s = strings(page.lang);
  const entries = items.map((it) => ({ ...it, anchor: it.id ?? slugify(it.label) }));
  const all = page.hasSummary ? [{ label: s.tldr, anchor: "tldr", depth: 0 }, ...entries] : entries;
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = all.map((e) => e.anchor);
    const onScroll = () => {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= Math.max(140, window.innerHeight * 0.3)) current = id;
      }
      setActive(current ?? ids[0] ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (!items.length) return null;
  return (
    <nav className="g-toc" aria-label={title ?? s.toc} style={{ fontFamily: t.font.family }}>
      <p className="g-toc-title" style={{ ...textStyle(t.font.label), fontWeight: t.weight.semibold, color: t.text.secondary, margin: "0 0 8px" }}>
        {title ?? s.toc}
      </p>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {all.map((e) => {
          const num = page.numbers[e.anchor];
          const isActive = active === e.anchor;
          return (
            <li key={e.anchor}>
              <a
                href={`#${e.anchor}`}
                className="g-toc-link"
                data-active={isActive || undefined}
                data-depth={e.depth ?? 0}
                style={{ paddingLeft: 12 + (e.depth ?? 0) * 16 }}
              >
                {num ? <span className="g-toc-num">{num}</span> : null}
                <span className="g-toc-label">{e.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
