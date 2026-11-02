import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A sideways-scrolling block that fades at an edge when there is more beyond
 * it (the kit's "scrolls sideways … fading at the edge with more beyond it").
 */
export function ScrollFade({ children, style, fade = 32 }: { children: ReactNode; style?: CSSProperties; fade?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ l: false, r: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const l = el.scrollLeft > 1;
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setEdges((p) => (p.l === l && p.r === r ? p : { l, r }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  const mask = `linear-gradient(to right, ${edges.l ? "transparent" : "#000"} 0, #000 ${edges.l ? fade : 0}px, #000 calc(100% - ${edges.r ? fade : 0}px), ${edges.r ? "transparent" : "#000"} 100%)`;
  return (
    <div
      ref={ref}
      className="g-scroll"
      data-fade-left={edges.l || undefined}
      data-fade-right={edges.r || undefined}
      style={{ overflowX: "auto", overflowY: "hidden", maskImage: mask, WebkitMaskImage: mask, ...style }}
    >
      {children}
    </div>
  );
}
