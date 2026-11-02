> 글을 쓰거나 고치기 전에 [docs/DESIGN_FEEDBACK.md](docs/DESIGN_FEEDBACK.md)를 먼저 읽는다.

# explainers-aside

공부하며 질문한 내용을 Grok Bot이 만든 설명 Page(React/TSX, `grok/canvas` 키트)를 **같은 디자인 그대로** 정적 사이트 글로 옮겨 게시하는 개인 설명글 사이트입니다.

- Astro 7 + MDX + React island + Tailwind CSS 4 + Base UI + KaTeX
- 완전 정적 출력(`dist/`), `<html lang="ko">`
- 배치: qlabs 방식(왼쪽 sticky 목차, TL;DR 상자, 번호 절). 좁은 화면에서는 목차가 위로 갑니다.

## 명령

```bash
npm install        # 이 폴더 안에만 설치
npm run dev        # 개발 서버 http://localhost:4321
npm run build      # dist/ 에 정적 사이트 생성
npm run preview    # 빌드 결과 미리보기
```

## 글 추가 방법

1. Grok Bot이 만든 Page 코드(`.tsx`)를 받습니다.
2. 새 폴더를 만듭니다: `src/content/posts/<slug>/`
3. 코드를 `src/content/posts/<slug>/page.tsx` 로 저장하고, **import 경로 한 줄만** 바꿉니다.
   ```diff
   - } from "grok/canvas";
   + } from "@/components/canvas";
   ```
   내용, 값, '예시' 문구는 바꾸지 않습니다.
4. 같은 폴더에 `index.mdx` 를 만듭니다.
   ```mdx
   ---
   slug: <slug>
   title: "글 제목 (Page의 title과 같게)"
   summary: "한두 문장 요약 (Page의 summary와 같게)"
   date: 2026-11-02
   ---
   import App from "./page.tsx";

   <App client:load />
   ```
5. `npm run build` 로 확인합니다. 홈(`/`) 글 목록에 날짜 역순으로 나타나고, 글은 `/posts/<slug>/` 에 생깁니다.

Page 없이 MDX로 직접 써도 됩니다. 본문의 `$…$`, `$$…$$` 수식은 KaTeX(remark-math + rehype-katex)가 빌드 때 조판합니다.

## 키트 부품 (`src/components/canvas/`)

원본 키트와 같은 이름·props로 다시 만들었습니다. `handoff/canvas-kit-types/*.d.ts` 의 설명을 사양으로 삼았습니다.

| 부품 | 메모 |
|-|-|
| `Page` | 제목, TL;DR 상자(`summary`), 번호 절. `TableOfContents` 를 찾아 왼쪽 sticky 목차로 옮김 |
| `Section` | 최상위는 번호 붙은 절 제목, 안쪽은 소제목, `Grid` 칸 안에서는 카드 제목. `collapsible` 은 Base UI Collapsible |
| `Text`, `Callout`, `Steps`, `BulletList`, `NumberedList`, `Properties` | 문단·강조 상자·단계·목록·키-값 |
| `Table` | 0.5px 테두리, 라벨 열(첫 열)은 흐린 잉크(60%), 숫자 열 오른쪽 정렬. 넓으면 가로 스크롤 + 가장자리 흐림 |
| `Bars`, `Heatmap`, `Diagram` | 차트 카드(1px 선, 16px 모서리, 20px 여백). `Diagram` 은 자체 DAG 배치, 넓으면 가로 스크롤 + 흐림 |
| `Equation`, `Frac`, `Pow`, `Sqrt`, `Paren`, `Sum` | 항 트리를 TeX로 바꿔 KaTeX가 조판 |
| `Segmented` | Base UI ToggleGroup |
| `Grid`, `Metrics`, `TableOfContents`, `computeDAGLayout`, `useGrokTheme`, React 훅 재수출 | |

디자인 토큰은 `src/components/canvas/tokens.ts` 한 곳에 있습니다. 출처는 `docs/DECISION_REVIEW.md` 에 적었습니다.

## 남은 한계

- 원본 키트 소스가 없어 `.d.ts` 설명을 보고 다시 만든 것입니다. 픽셀 단위로 같지는 않습니다.
- 밝은 모드만 지원합니다(원본은 보는 사람의 밝음/어두움 모드를 따름).
- 원본 글의 `App` 이 `useState` 를 쓰므로 글 전체가 하나의 React island(`client:load`)입니다. HTML은 빌드 때 미리 그려집니다.
- 브랜드 글꼴(XVF) 대신 시스템 글꼴을 씁니다(키트 설명의 대체 경로).
