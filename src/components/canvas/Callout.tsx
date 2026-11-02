import type { ReactNode } from "react";
import { useGrokTheme, textStyle } from "./hooks";

export type Tone = "success" | "warning" | "danger";
export type CalloutTone = "info" | Tone;
export interface CalloutProps {
  lead?: string;
  tone?: CalloutTone;
  children?: ReactNode;
}

function ToneIcon({ tone, color }: { tone: CalloutTone; color: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (tone === "success") return <svg {...common}><circle cx="10" cy="10" r="7.25" /><path d="M7 10.2l2 2 4-4.4" /></svg>;
  if (tone === "warning") return <svg {...common}><path d="M10 3.5l7 12.5H3z" /><path d="M10 8.5v3" /><circle cx="10" cy="13.7" r=".4" fill={color} /></svg>;
  if (tone === "danger") return <svg {...common}><circle cx="10" cy="10" r="7.25" /><path d="M7.5 7.5l5 5M12.5 7.5l-5 5" /></svg>;
  return <svg {...common}><circle cx="10" cy="10" r="7.25" /><path d="M10 9v4.5" /><circle cx="10" cy="6.6" r=".4" fill={color} /></svg>;
}

/** The page's one takeaway: a bold lead and a line or two in a box. */
export function Callout({ lead, tone, children }: CalloutProps) {
  const t = useGrokTheme();
  if (!lead && (children === undefined || children === null || children === "")) return null;
  const map = {
    info: { bg: t.fill.accentSubtle, lead: t.text.accent, body: t.text.accentDeep },
    success: { bg: t.fill.successSubtle, lead: t.text.success, body: t.text.successDeep },
    warning: { bg: t.fill.warningSubtle, lead: t.text.warning, body: t.text.warningDeep },
    danger: { bg: t.fill.dangerSubtle, lead: t.text.danger, body: t.text.dangerDeep },
  } as const;
  const c = tone ? map[tone] : { bg: t.fill.secondary, lead: t.text.primary, body: t.text.primary };
  return (
    <div
      role="note"
      style={{ background: c.bg, borderRadius: t.radius.lg, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}
    >
      {tone ? (
        <span style={{ flex: "none", marginTop: 2 }}>
          <ToneIcon tone={tone} color={c.lead} />
        </span>
      ) : null}
      <div style={{ minWidth: 0 }}>
        {lead ? <p style={{ ...textStyle(t.font.body1), fontWeight: t.weight.semibold, color: c.lead, margin: "0 0 4px" }}>{lead}</p> : null}
        {children ? <p className="g-text" style={{ ...textStyle(t.font.body1), color: c.body, margin: 0 }}>{children}</p> : null}
      </div>
    </div>
  );
}
