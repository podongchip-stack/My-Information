# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

개인 포트폴리오 싱글 페이지. Next.js 16 App Router + Three.js 기반.

- **Live:** https://donghyeon-portfolio.vercel.app
- **GitHub:** https://github.com/podongchip-stack/My-Information

## 기술 스택

- Next.js 16 (App Router, Turbopack) / React 19 / TypeScript
- Tailwind CSS 4
- Framer Motion (스크롤 애니메이션), Lottie (`public/lottie`)
- Three.js + React Three Fiber + Drei (Hero 3D 캔버스)

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000, Turbopack)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

## 구조

```
app/                 # layout.tsx, page.tsx, globals.css
components/
  sections/          # Hero, About, Skills, Projects, Awards, Contact (page.tsx에서 이 순서로 렌더)
  ui/                # Navbar, ScrollReveal, HeroCanvas, ProjectCard 등 재사용 컴포넌트
data/                # 콘텐츠 데이터 — 내용 수정은 여기서!
  projects.ts
  awards.ts
  skills.ts
public/lottie/       # Lottie 애니메이션 JSON
```

**콘텐츠(텍스트/항목) 수정은 `data/`의 `*.ts` 파일을 편집한다.** 컴포넌트 JSX를 직접 고치지 않아도 된다.

## 작업 시 주의사항 (중요)

- **`data/awards.ts`의 `description` 서식 규칙:**
  - 줄바꿈은 `\n`으로 넣는다. (렌더링은 `components/sections/Awards.tsx`에서 `whitespace-pre-line` 클래스로 처리됨 — 이 클래스를 지우면 `\n`이 공백으로 무시되니 주의)
  - 특정 문구 강조는 `**텍스트**`로 감싼다. (`Awards.tsx`의 `renderDescription` 헬퍼가 `<strong>`으로 변환)
  - 다른 섹션(`projects.ts`, `skills.ts`)에는 이 서식 처리가 없으니, 같은 기능이 필요하면 해당 컴포넌트에도 동일 패턴을 추가해야 한다.

- **배포:** Git 연동 자동배포가 아니라 **Vercel CLI 직접 배포** 방식이다. (프로젝트는 `.vercel/`로 `donghyeon-portfolio`에 연결돼 있음)
  ```bash
  npx vercel --prod --yes    # 프로덕션(donghyeon-portfolio.vercel.app)로 배포
  ```
  CLI가 전역 설치돼 있지 않으므로 `npx`로 실행한다. 인증이 안 돼 있으면 `npx vercel login` 필요.
  → **GitHub에 push해도 사이트는 자동 갱신되지 않는다. 배포는 위 명령을 따로 실행해야 한다.**

- **GitHub 업데이트:**
  ```bash
  git add -A && git commit -m "메시지" && git push
  ```

## 커밋하면 안 되는 것 (.gitignore에 반영됨)

- `node_modules/`, `.next/`, `out/`, `build/` — 빌드/의존성 산출물
- `.vercel/` — 배포 연결 정보 (시크릿 성격)
- `.env*` — 환경변수 (현재 이 프로젝트엔 env 파일 없음)
- `*.tsbuildinfo`, `next-env.d.ts`, `.DS_Store`

새 파일을 추가할 때 위 범주에 해당하면 `.gitignore`에 들어가 있는지 먼저 확인할 것.
