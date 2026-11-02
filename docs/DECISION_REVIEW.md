# DECISION_REVIEW

이 저장소를 만들며 쓴 명령과 내린 결정을 기록합니다. 비밀값·토큰은 적지 않습니다.

- 작업자: Aside (계획·구현·검토 단독, Claude CLI·Codex CLI 사용 안 함)
- 시작: 2026-11-02 13:56 KST
- 비교 실험 규칙: 기존 `~/projects/explainers` 폴더는 읽지도 복사하지도 않았습니다. 자료는 `~/projects/explainers-ref/SPEC.md` 와 `handoff/` 만 봤습니다.

## 1. 조사

| 명령 / 행동 | 결과 · 결정 |
|-|-|
| `cat SPEC.md handoff/llm-page.tsx handoff/canvas-kit-types/{tokens,hooks,index}.d.ts reference.md` | 원본 글이 쓰는 부품 19개 확인. 타입 크기(30/36, 24/30, 20/26, 16/24, 14/20, 15/22, 13/18, 12/16, 11/16), 굵기(400/500/600), 모서리(4/8/12/16), 잉크 비율(60%, 40%, 9%, 15%, 6%, 5~40%)은 `.d.ts` 에 적힌 값 그대로 사용 |
| `grep '#[0-9a-f]{6}' handoff/canvas-kit-types/*` | **hex 색 값이 하나도 없음**(`tokens.d.ts` 는 타입만 있음). 임시값을 피하려고 실제 출처를 찾기로 함 |
| `grep -a` 로 `/Applications/Grok Bot.app/Contents/Resources/app.asar` 읽기(읽기 전용) | Grok Bot 데스크톱 앱의 실제 디자인 토큰 발견: 잉크 `--sand-text-primary:#1c1c1c`, 파랑 `#1680f3`/`#0b6dd3`, 상태색, `dataviz` 팔레트(`#1084FE`, singleSeriesRest `#B5D9FF`, sequential 파랑 6단계, other `#777777`, negative `#C21D2E`), 글꼴 스택 `-apple-system, BlinkMacSystemFont, "Segoe UI"`, mono `ui-monospace, SFMono-Regular, Menlo…` |
| 결정 | 잉크 비율 토큰은 `#1c1c1c` + `.d.ts` 의 퍼센트를 8자리 hex로 계산(예: 60% → `#1c1c1c99`). 키트가 말한 "파랑·노랑·청록 3계열, 밝음/어두움 같은 값"은 앱 dataviz에서 파랑 `#1084FE` 과 같은 단계인 `#FF9800`, `#00BCA6` 을 사용. 한국어 대체 글꼴(Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic)을 스택 뒤에 추가 |
| `handoff/dust.html` CSS 읽기 | qlabs 배치 값 사용: 목차 210px + 본문, 사이 간격 `max(56px, (100vw − …)/2)`, 목차 `sticky; top 28px`, 항목 왼쪽 2px 선·13px 글자, TL;DR 상자(대문자·자간 .14em 라벨), 1040px 이하에서 한 단 |

## 2. 설치·빌드

| 명령 | 결과 · 결정 |
|-|-|
| `npm view astro @astrojs/mdx @astrojs/react @base-ui/react …` | Astro 7.4.4, Tailwind 4.3, KaTeX 0.19, React 19. Base UI는 `@base-ui-components/react` 가 `@base-ui/react` 로 이름이 바뀜(deprecated 메시지 확인) → `@base-ui/react` 사용 |
| `npm install astro @astrojs/mdx @astrojs/react react react-dom @base-ui/react tailwindcss @tailwindcss/vite katex remark-math rehype-katex` / `npm install -D typescript @types/react @types/react-dom` | 이 폴더 안에만 설치. 전역 설치 없음 |
| `npm run build` | 실패: rolldown 네이티브 모듈(`.node`)을 macOS가 막음(`library load disallowed by system policy`). 원인: Aside 샌드박스가 쓴 파일에 `com.apple.quarantine` 속성이 붙음 |
| 결정: Homebrew node(`/opt/homebrew/bin/node` v26.12)로 `npm ci`, 그 뒤 `find node_modules -name "*.node" -exec xattr -d com.apple.quarantine {} \;` | 이 프로젝트 `node_modules` 안 `.node` 8개의 격리 속성만 지움(범위 최소화). 빌드 성공 |
| `npm install @astrojs/markdown-remark` | Astro 7은 MDX의 `remarkPlugins` 를 무시한다는 경고 → `markdown.processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] })` 로 옮김. 경고 없어짐 |

## 3. 구조 결정

- **글 = 콘텐츠 컬렉션의 MDX + 원본 TSX.** `src/content/posts/<slug>/index.mdx` 가 frontmatter(slug, title, summary, date)를 갖고 같은 폴더의 원본 TSX를 `<App client:load />` 로 넣음. 홈은 컬렉션을 날짜 역순으로 나열.
- **원본 글은 import 한 줄만 변경**: `"grok/canvas"` → `"@/components/canvas"`. `diff` 로 다른 줄이 없음을 확인.
- **island 범위**: 원본 `App` 이 `useState` 를 직접 쓰므로 글 전체가 하나의 island. 코드를 바꾸지 않는 규칙이 우선. HTML은 빌드 때 미리 그려지므로 JS 없이도 내용이 보임.
- **Page가 배치를 맡음**: 자식 중 `TableOfContents` 를 찾아 `<aside>` 로 옮기고, 최상위 `Section` 에 번호(1~9)를 붙임. 목차에도 같은 번호. `summary` 는 TL;DR 상자. 목차 맨 위에 TL;DR 항목.
- **간격**: 절 사이 64px, 문단 16px, 목록 24px, 그림 32px, 수식 위아래 16px(키트 설명 값).
- **표**: 0.5px 선, 머리글 14/20 medium, 첫 열(라벨 열) `text.secondary`(잉크 60%), 숫자 열 오른쪽 정렬·tabular-nums, 5열 이상은 줄바꿈 없이 가로 스크롤.
- **가로 스크롤 흐림**: `ScrollFade` 가 스크롤 위치를 보고 왼쪽/오른쪽에 32px `mask-image` 그라데이션을 켬. 표·Heatmap·Diagram에 사용.
- **Heatmap**: 칸 높이 27px, 너비 12~54px로 블록 폭을 나눔 → 390px 화면에서 6열 모두 보임(스크롤 없음, 측정: scrollWidth 308 = clientWidth 308).
- **Diagram**: 자체 DAG 배치(DFS로 되돌아가는 선 찾기, 최장 경로로 단 나누기). 되돌아가는 선("아니오")은 오른쪽 통로로. 블록이 좁으면 통로 라벨을 세로로 돌려 노드가 화면 안에 들어오게 함. 그래도 넓으면 가로 스크롤 + 흐림. 축소하지 않음.
- **Equation**: `Frac/Pow/Sqrt/Paren/Sum` 트리를 TeX로 바꿔 KaTeX가 빌드 때 조판(`softmax`, `Attention` 같은 단어는 `\mathrm`).
- **Segmented**: Base UI `ToggleGroup` + `Toggle`. 선택 칸은 흰 바탕 + 그림자(`#1c1c1c1f`, 앱의 control 그림자).
- **키트 문구**: 페이지 `lang="ko"` 이므로 "On this page/Fewer/More" 를 "목차/적음/많음" 으로.

## 4. 검토(미리보기)

| 명령 / 행동 | 결과 |
|-|-|
| `npx astro preview --port 4329 --host 127.0.0.1` + 브라우저 1440px, 390px | 첫 확인에서 문단의 inline `margin: 0` 이 그림 뒤 32px 간격을 덮는 문제 발견 → inline margin 제거, CSS로 이동 |
| 390px 확인 | Diagram 라벨이 흐림에 가려짐 → 좁을 때 라벨 세로 배치 추가. 표는 366 > 350px 이라 오른쪽 흐림이 보임 |
| `Segmented` 5 클릭 | Properties 가 "5. FFN과 층 반복" 으로 바뀜(hydration 정상) |
| 스크린샷 | `explainers-ref/aside-run/desktop.png`(1440 전체), `mobile.png`(390 전체), `home.png`. 브라우저 확장(Moonlight) 위젯은 촬영 때만 숨김. 촬영 후 서버 종료 |

| `npx tsc --noEmit -p .` | TS 7이 `baseUrl` 을 없앴다는 오류 → `paths: {"@/*": ["./src/*"]}` 로 고침. 원본 글 포함 타입 검사 통과(exit 0) |

## 5. 배포

| 명령 | 결과 |
|-|-|
| `git init -b main`, `git add -A`, `git commit` | `dist/`, `node_modules/`, `.astro/`, `.vercel/`, `.env*` 는 `.gitignore`. `explainers-ref` 자료는 저장소 밖이라 커밋되지 않음 |
| `gh repo create tunatuna1002-lab/explainers-aside --public --source=. --remote=origin --push` | https://github.com/tunatuna1002-lab/explainers-aside (동원 승인) |
| `vercel deploy --prod --yes` | 새 프로젝트 `explainers-aside` 생성, Vercel에서 `npm install` + `astro build` 성공, Ready 17s. 별칭 https://explainers-aside.vercel.app (동원 승인). CLI가 `.gitignore` 에 `.vercel` 한 줄 추가 |
| `curl -s -o … -w "%{http_code}" https://explainers-aside.vercel.app/` 와 `/posts/llm/` | 둘 다 200, `<html lang="ko">`, 글 페이지에 KaTeX 출력 포함 |

## 6. 원본 Page와 다른 점 (남은 한계)

- 원본 키트 소스가 없어 `.d.ts` 설명과 Grok Bot 앱 토큰으로 다시 만든 것이라 픽셀 단위로 같지 않습니다. 특히 Diagram 노드 크기는 글자 폭 추정으로 계산합니다(원본은 실제 측정).
- 노랑·청록 데이터 색은 앱 dataviz에서 고른 값이며, 키트 고유 값과 다를 수 있습니다(이 글에서는 TokenChips 밑줄 2개에만 쓰임).
- 밝은 모드만 지원합니다.
- 수식은 KaTeX 글꼴(세리프)로 나옵니다. 원본은 본문 글꼴로 항을 배치합니다.
- 글 전체가 하나의 island 라 React(약 190KB gzip 전)를 내려받습니다.
- 브랜드 글꼴 XVF 대신 시스템 글꼴.

## 7. 시간

- 시작 13:56, 배포 확인 14:18 (KST) → 약 22분.
