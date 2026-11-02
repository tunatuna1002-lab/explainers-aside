import type { ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";

/** A paragraph of body text. Use one `Text` per paragraph. */
export function Text({ children }: { children?: ReactNode }) {
  const t = useGrokTheme();
  return (
    <p className="g-text" style={{ ...textStyle(t.font.body1), color: t.text.primary }}>
      {children}
    </p>
  );
}
