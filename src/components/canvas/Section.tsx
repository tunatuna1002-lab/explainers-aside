import { useState, type ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { useGrokTheme, textStyle } from "./hooks";
import { LevelContext, slugify, useLevel } from "./context";

export interface SectionProps {
  heading?: string;
  id?: string;
  caption?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: ReactNode;
}

/**
 * One section: heading, its blocks, an optional caption. Directly in the Page
 * it is a numbered section heading (qlabs style); inside a Section it is a
 * sub-section; in a Grid cell it is the card's title.
 */
export function Section({ heading, id, caption, actions, collapsible, defaultOpen, children }: SectionProps) {
  const t = useGrokTheme();
  const level = useLevel();
  const anchor = id ?? (heading ? slugify(heading) : undefined);
  const top = level.depth === 0 && !level.inGrid;
  const [open, setOpen] = useState(!!defaultOpen);

  const headingStyle = level.inGrid
    ? { ...textStyle(t.font.body1), fontWeight: t.weight.semibold }
    : top
      ? { ...textStyle(t.font.heading2), fontWeight: 700 }
      : { ...textStyle(t.font.heading3), fontWeight: t.weight.semibold };
  const H = top ? "h2" : "h3";

  const head = heading ? (
    <div className="g-section-head" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <H style={{ ...headingStyle, margin: 0, flex: "1 1 auto", textWrap: "balance" }}>
        {top && level.number ? (
          <span className="g-num" style={{ color: t.text.tertiary, fontWeight: t.weight.medium, marginRight: "0.4em" }}>
            {level.number}
          </span>
        ) : null}
        {heading}
      </H>
      {actions ? <div>{actions}</div> : null}
    </div>
  ) : null;

  const blocks = (
    <LevelContext.Provider value={{ depth: level.depth + 1, inGrid: false }}>
      <div className="g-blocks">{children}</div>
      {caption ? (
        <p style={{ ...textStyle(t.font.subtext), color: t.text.secondary, margin: "12px 0 0" }}>{caption}</p>
      ) : null}
    </LevelContext.Provider>
  );

  const cls = top ? "g-section" : level.inGrid ? "g-cell-section" : "g-subsection";

  if (collapsible && heading) {
    return (
      <Collapsible.Root open={open} onOpenChange={setOpen} render={<section id={anchor} className={cls} />}>
        <Collapsible.Trigger className="g-collapse-trigger">
          <span aria-hidden style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: `transform ${t.motion.hover} ${t.motion.easing}` }}>›</span>
          {head}
        </Collapsible.Trigger>
        <Collapsible.Panel>{blocks}</Collapsible.Panel>
      </Collapsible.Root>
    );
  }
  return (
    <section id={anchor} className={cls}>
      {head}
      {blocks}
    </section>
  );
}
