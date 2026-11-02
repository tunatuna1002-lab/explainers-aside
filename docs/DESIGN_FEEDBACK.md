# 디자인 피드백 기록

새 글을 쓰거나 고치기 전에 이 파일을 먼저 읽고, 아래 규칙을 지킵니다.

## 반드시 지킬 규칙

1. **흐름도(`Diagram`)의 단계 사이 화살표는 짧게 유지한다.** (2026-11-02)
   - 동원 원문 요약: Claude CLI판(explainers-nine.vercel.app)과 비교해 Aside판이 낫다고 함. Claude판은 화살표가 너무 길었다.
   - 실제 값 (`src/components/canvas/Diagram.tsx`):
     - 단계(rank) 사이 간격 `rankGapBase = 32` (72행). 같은 단계 안 노드 사이 간격은 24px (86행).
     - 선과 노드 면 사이 여백 `CLEAR = 8` (27행). 그래서 화살표 선의 눈에 보이는 길이는 32 − 8 − 8 = **16px**.
     - 바깥 여백 `PAD = 4` (71행). 선 두께 1.5px, 화살촉 5px.
   - Claude판(`~/projects/explainers/src/components/canvas/Diagram.tsx`, 읽기만 함): `RANK_GAP = 56`, `NODE_GAP = 40`, `PAD = 24`, `CLEAR = 8`. 선 길이 56 − 16 = 40px. 이 값이 "너무 길다"는 평가를 받았다.
   - 지키는 법: `rankGapBase`를 32보다 크게 올리지 않는다. 글에서 `Diagram`에 간격 값을 따로 넘기지 않는다.

2. **목차(`TableOfContents`)는 왼쪽 sticky 열에 두는 지금 방식을 유지한다.** (2026-11-02)
   - 동원 원문 요약: 목차 위치와 배치는 Aside판이 Claude판보다 동원이 원하던 것에 가깝다.
   - 실제 값 (`src/styles/global.css`):
     - `.g-page` (43~51행): `grid-template-columns: 210px minmax(0, 700px)`. 목차 열 210px, 본문 열 최대 700px.
     - 열 사이 간격 `column-gap: max(56px, calc((100vw - 1040px) / 2))`. 좁으면 56px, 화면이 넓으면 가운데로 모이도록 더 커진다.
     - 쪽 여백 `padding: 32px 24px 96px 40px`.
     - `.g-outline` (53행): `grid-column: 1; grid-row: 1 / span 2; position: sticky; top: 28px; max-height: calc(100vh - 56px); overflow-y: auto; padding-top: 6px`. 제목과 본문 둘 다 옆에 걸쳐 붙는다.
     - 목차 항목 `.g-toc-link` (74~85행): 13px / 줄높이 18px, 왼쪽 2px 선, 현재 절은 굵기 500과 진한 선.
     - 1040px 이하(88~94행)에서는 한 열로 바꾸고 목차를 제목 아래 테두리 상자(`padding: 14px 16px 10px`, 모서리 12px)로 보낸다.
   - Claude판(`~/projects/explainers/src/components/canvas/canvas.css`, 읽기만 함): `.cv-page`는 `column-gap: 56px; justify-content: center`, `.cv-toc-slot`은 `padding-top: 52px`. 목차가 제목보다 아래에서 시작하고 열 간격이 고정이다. 동원은 이쪽보다 Aside판을 택했다.
   - 지키는 법: `.g-page`, `.g-outline`, `.g-toc-*` 값을 바꾸지 않는다. 글 쪽에서는 `Page`의 `width` 기본값(`"column"`)과 최상위 `TableOfContents` 한 개를 그대로 쓴다.

## 피드백 기록

| 날짜 | 글 | 동원 피드백 | 반영한 규칙 번호 |
|-|-|-|-|
| 2026-11-02 | LLM 작동 원리 (`llm`) | Claude CLI판과 비교해 Aside판의 흐름도 화살표 길이가 더 낫다(Claude판은 너무 김) | R1 |
| 2026-11-02 | LLM 작동 원리 (`llm`) | 목차 위치·배치가 Aside판이 원하던 것에 더 가깝다 | R2 |

## 쓰는 법

1. 새 글을 쓰거나 고치기 전에 이 파일을 먼저 읽고 규칙을 지킨다.
2. 새 피드백이 오면 "피드백 기록" 표에 한 줄 추가한다 (날짜, 글, 동원 피드백, 반영한 규칙 번호).
3. 같은 요구가 다시 나오거나 다른 글에도 적용될 요구면 "반드시 지킬 규칙"에 번호를 붙여 올린다. 규칙에는 날짜, 동원 원문 요약, 실제 코드 위치와 값(CSS 클래스, px 등)을 적는다.
