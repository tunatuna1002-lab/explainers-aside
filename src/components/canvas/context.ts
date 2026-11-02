import { createContext, useContext } from "react";

export interface PageInfo {
  lang: string;
  hasSummary: boolean;
  /** section id -> section number ("1", "2", …), top-level sections only */
  numbers: Record<string, string>;
}
export const PageContext = createContext<PageInfo>({ lang: "ko", hasSummary: false, numbers: {} });
export const usePage = () => useContext(PageContext);

export interface LevelInfo {
  /** -1 outside any section, 0 inside a top-level section, … */
  depth: number;
  inGrid: boolean;
  number?: string;
}
export const LevelContext = createContext<LevelInfo>({ depth: -1, inGrid: false });
export const useLevel = () => useContext(LevelContext);

/** "What changed" -> "what-changed"; keeps Hangul. */
export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/** Kit chrome strings; the page's lang picks the set. */
export const STRINGS = {
  ko: { toc: "목차", tldr: "TL;DR", fewer: "적음", more: "많음", back: "글 목록" },
  en: { toc: "On this page", tldr: "TL;DR", fewer: "Fewer", more: "More", back: "All posts" },
} as const;
export const strings = (lang: string) => (lang.startsWith("ko") ? STRINGS.ko : STRINGS.en);
