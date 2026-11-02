import { grokLight, type GrokTheme } from "./tokens";
export type { GrokDataViz, GrokPalette, GrokTextStyle, GrokTheme, GrokWeightScale } from "./tokens";

/** Returns the Grok page tokens. This site is light only (see README, limits). */
export function useGrokTheme(): GrokTheme {
  return grokLight;
}

/** Spreads one text style into a React style object. */
export function textStyle(s: GrokTheme["font"]["body1"]) {
  return { fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing };
}
