import katex from "katex";

export interface TexProps {
  /** LaTeX 식. */
  children: string;
  /** 한 줄 가운데 정렬 식이면 true. */
  display?: boolean;
}

/** KaTeX 조판. KaTeX CSS는 layouts/Base.astro 가 불러온다. */
export function Tex({ children, display = false }: TexProps) {
  const html = katex.renderToString(children, { displayMode: display, throwOnError: false });
  const Tag = display ? "div" : "span";
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
