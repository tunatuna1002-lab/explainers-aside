/**
 * Grok Bot page tokens (light).
 *
 * Where each value comes from (see docs/DECISION_REVIEW.md):
 * - Type scale, weights, radii, ink percentages: handoff/canvas-kit-types
 *   (tokens.d.ts, hooks.d.ts, reference.md) as written there.
 * - Hex colors: the Grok Bot desktop app's own design tokens
 *   (`--sand-*` CSS variables and its `dataviz` palette in
 *   /Applications/Grok Bot.app, read-only), because tokens.d.ts only ships
 *   the types. Alpha-hex steps are ink #1c1c1c at the percent tokens.d.ts names.
 */
export interface GrokTextStyle {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
  readonly fontVariationSettings?: string;
}

export interface GrokPalette {
  readonly bg: { readonly base: string; readonly subtle: string; readonly elevated: string };
  readonly text: {
    readonly primary: string; readonly secondary: string; readonly tertiary: string;
    readonly onColor: string; readonly onPrimary: string;
    readonly accent: string; readonly success: string; readonly warning: string; readonly danger: string;
    readonly accentDeep: string; readonly successDeep: string; readonly warningDeep: string; readonly dangerDeep: string;
  };
  readonly fill: {
    readonly primary: string; readonly primaryHover: string;
    readonly secondary: string; readonly secondaryHover: string;
    readonly hover: string; readonly pressed: string;
    readonly accent: string; readonly controlChecked: string;
    readonly accentSubtle: string; readonly successSubtle: string; readonly warningSubtle: string; readonly dangerSubtle: string;
  };
  readonly border: { readonly subtle: string; readonly weak: string; readonly default: string; readonly strong: string; readonly focus: string };
}

export interface GrokDataViz {
  readonly categorical: readonly string[];
  readonly other: string;
  readonly negative: string;
  readonly singleSeriesRest: string;
  readonly areaAlpha: string;
  readonly bandAlpha: string;
  readonly blueTint: string;
  readonly blue5: string;
  readonly sequential: readonly string[];
  readonly diverging: readonly string[];
}

export type GrokWeightScale = { readonly regular: 400 | 425; readonly medium: 500; readonly semibold: 600 };

export interface GrokTheme extends GrokPalette {
  readonly kind: "light" | "dark";
  readonly font: {
    readonly family: string; readonly mono: string;
    readonly heading1: GrokTextStyle; readonly heading2: GrokTextStyle; readonly heading3: GrokTextStyle;
    readonly body1: GrokTextStyle; readonly subtext: GrokTextStyle; readonly table: GrokTextStyle;
    readonly metric: GrokTextStyle; readonly body2: GrokTextStyle; readonly label: GrokTextStyle;
    readonly caption: GrokTextStyle; readonly code: GrokTextStyle;
  };
  readonly weight: GrokWeightScale;
  readonly radius: { readonly sm: 4; readonly md: 8; readonly lg: 12; readonly xl: 16; readonly full: 9999 };
  readonly motion: { readonly hover: string; readonly easing: string };
  readonly dataviz: GrokDataViz;
  readonly chart: readonly [string, string, string, string];
}

/** Ink of the Grok Bot PD system (`--sand-text-primary`). */
const INK = "#1c1c1c";
/** ink at a percent, as an 8-digit hex (tokens.d.ts: "Alpha-hex entries are ink at the design's percent"). */
const ink = (pct: number) => INK + Math.round((pct / 100) * 255).toString(16).padStart(2, "0");

const style = (size: number, line: number, letterSpacingEm = 0): GrokTextStyle => ({
  fontSize: `${size}px`,
  lineHeight: `${line}px`,
  letterSpacing: letterSpacingEm ? `${letterSpacingEm}em` : "0",
});

export const grokLight: GrokTheme = {
  kind: "light",
  bg: { base: "#ffffff", subtle: "#f5f5f5", elevated: "#ffffff" },
  text: {
    primary: INK,
    secondary: ink(60), // "Ink at 60%: summaries, table label column, details"
    tertiary: ink(40), // "Ink at 40%: captions, markers, axes"
    onColor: "#ffffff",
    onPrimary: "#ffffff",
    accent: "#0b6dd3",
    success: "#00854a",
    warning: "#aa6300",
    danger: "#cd2834",
    accentDeep: "#084382", // data/blue/5
    successDeep: "#00854a",
    warningDeep: "#aa6300",
    dangerDeep: "#c21d2e",
  },
  fill: {
    primary: INK,
    primaryHover: "#363636",
    secondary: ink(9),
    secondaryHover: ink(15),
    hover: ink(6),
    pressed: ink(9),
    accent: "#1680f3",
    controlChecked: "#1680f3",
    accentSubtle: "#1e86fc17",
    successSubtle: "#14c16f17",
    warningSubtle: "#f5931217",
    dangerSubtle: "#fb2b3e17",
  },
  border: { subtle: ink(5), weak: ink(10), default: ink(15), strong: ink(30), focus: ink(40) },
  font: {
    family:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    heading1: style(30, 36, -0.015),
    heading2: style(24, 30, -0.012),
    heading3: style(20, 26, -0.008),
    body1: style(16, 24),
    subtext: style(14, 20),
    table: style(15, 22),
    metric: style(24, 30, -0.012),
    body2: style(13, 18),
    label: style(12, 16),
    caption: style(11, 16, 0.005),
    code: style(13, 20),
  },
  weight: { regular: 400, medium: 500, semibold: 600 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  motion: { hover: "120ms", easing: "cubic-bezier(0.2, 0, 0, 1)" },
  dataviz: {
    categorical: ["#1084FE", "#FF9800", "#00BCA6"], // blue, yellow, cyan
    other: "#777777",
    negative: "#C21D2E",
    singleSeriesRest: "#B5D9FF",
    areaAlpha: "29", // 16%
    bandAlpha: "40", // 25%
    blueTint: "#1084FE29",
    blue5: "#084382",
    sequential: ["#D6EAFF", "#80BEFE", "#459FFE", "#1084FE", "#0C64C1", "#084382"],
    diverging: ["#C21D2E", "#FF8C98", "#E8E8E8", "#80BEFE", "#0C64C1"],
  },
  chart: [INK, ink(40), ink(20), ink(9)],
};

/** CSS custom properties for Astro pages and the kit's stylesheet (one source of truth). */
export function themeCssVars(t: GrokTheme = grokLight): string {
  const v: Record<string, string> = {
    "--g-bg": t.bg.base,
    "--g-bg-subtle": t.bg.subtle,
    "--g-ink": t.text.primary,
    "--g-ink-2": t.text.secondary,
    "--g-ink-3": t.text.tertiary,
    "--g-accent": t.text.accent,
    "--g-fill": t.fill.primary,
    "--g-fill-2": t.fill.secondary,
    "--g-fill-2-hover": t.fill.secondaryHover,
    "--g-hover": t.fill.hover,
    "--g-pressed": t.fill.pressed,
    "--g-line-subtle": t.border.subtle,
    "--g-line-weak": t.border.weak,
    "--g-line": t.border.default,
    "--g-line-strong": t.border.strong,
    "--g-focus": t.border.focus,
    "--g-font": t.font.family,
    "--g-mono": t.font.mono,
    "--g-motion": `${t.motion.hover} ${t.motion.easing}`,
  };
  return `:root{${Object.entries(v).map(([k, x]) => `${k}:${x}`).join(";")}}`;
}
