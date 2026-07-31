# Donghyeon Portfolio

개인 포트폴리오 웹사이트입니다. 스크롤에 따라 형상이 바뀌는 3D 배경 위에,
케이스 스터디 중심으로 작업을 정리했습니다. 한국어/영어를 지원합니다.

🔗 **Live:** [donghyeon-portfolio.vercel.app](https://donghyeon-portfolio.vercel.app)

## 구조

한 페이지 안에서 다섯 섹션이 이어지고, 기록이 있는 작업은 별도 상세 페이지를 갖습니다.

| 경로 | 내용 |
| --- | --- |
| `/ko`, `/en` | Hero → Now → Experience → Work → Open Source → Contact |
| `/{lang}/work/{slug}` | 케이스 스터디 — 문제 / 맡은 범위 / 접근 / 결과 / 회고 |

루트(`/`)는 `next.config.ts`의 리다이렉트로 `/ko`에 연결됩니다.

## 3D 배경

`components/scene/`의 파티클 필드가 스크롤 진행도에 따라 세 형상 사이를 오갑니다.

```
스크롤 0% ──────────── 50% ──────────── 100%
배터리 셀 격자   →   신경망(방전 연출)   →   서버 랙
```

- 형상 좌표는 `shapes.ts`에서 한 번만 계산하고, 인덱스 대응이 꼬이지 않도록 각도로 정렬합니다.
- 선분은 형상마다 따로 이어두고 해당 구간에서만 페이드 인 합니다.
- `prefers-reduced-motion`이 켜져 있으면 캔버스를 띄우지 않고 정적 배경으로 대체합니다.
- 좁은 화면이나 코어 4개 이하에서는 노드 수를 430 → 240으로 줄입니다 (엣지 계산이 O(n²)).

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 프레임워크 | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 언어 | TypeScript, React 19 |
| 스타일링 | Tailwind CSS 4 |
| 애니메이션 | Framer Motion, Lottie |
| 3D | Three.js, React Three Fiber |
| 배포 | Vercel |

## 시작하기

```bash
npm install
npm run dev      # http://localhost:3000 → /ko 로 리다이렉트
npm run build
npm run start
```

> Node.js 20 이상 권장

Kaggle 통계를 함께 보려면 `.env.local`에 API 키가 필요합니다. 없으면 Hugging Face 항목만 표시됩니다.

```bash
KAGGLE_USERNAME=...
KAGGLE_KEY=...
```

## 프로젝트 구조

```
app/
  [lang]/            # ko | en 라우팅 (layout이 <html>을 담당)
    page.tsx         # 메인 한 페이지
    work/[slug]/     # 케이스 스터디 상세
components/
  scene/             # 스크롤 구동 3D 배경
  sections/          # Hero, Now, Experience, Work, OpenSource, Contact
  ui/                # Navbar, Footer, Section, Reveal, CountUp 등
data/
  work.ts            # 작업 목록 + 케이스 스터디 본문
  timeline.ts        # 경력·수상 타임라인
lib/
  i18n.ts            # 언어 타입과 헬퍼
  content/ui.ts      # 화면 문구 사전 (ko/en)
  stats.ts           # Hugging Face / Kaggle 다운로드 통계
```

## 콘텐츠 수정

모든 텍스트는 `{ ko: "...", en: "..." }` 형태로 두 언어를 함께 들고 있습니다.

- **작업 추가** — `data/work.ts`에 항목을 추가합니다. `study` 필드를 채우면 상세 페이지가 자동으로 생성되고,
  비워두면 목록에 "상세 기록 준비 중"으로만 표시됩니다.
- **수치 표** — `study.metrics`에 `before`를 넣으면 "이전 → 이후"로, 생략하면 값 하나만 렌더링됩니다.
- **타임라인** — `data/timeline.ts`. `start`(YYYY.MM) 기준으로 자동 정렬되며, `kind`는 `work | project | award`입니다.
- **화면 문구** — `lib/content/ui.ts`.

팀 프로젝트는 `team` 필드에 인원을 적고, `study.role`에 본인이 맡은 범위를 명시합니다.

## 배포

[Vercel](https://vercel.com)에 배포되어 있습니다. `main` 브랜치 기준으로 프로덕션이 갱신됩니다.
