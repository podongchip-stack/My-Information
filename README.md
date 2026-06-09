# Donghyeon Portfolio

개인 포트폴리오 웹사이트입니다. 3D 인터랙션과 스크롤 애니메이션을 적용한 싱글 페이지로 구성되어 있습니다.

🔗 **Live:** [donghyeon-portfolio.vercel.app](https://donghyeon-portfolio.vercel.app)

## 구성 섹션

- **Hero** — 3D 캔버스(Three.js) 인트로
- **About** — 자기소개
- **Skills** — 기술 스택 뱃지
- **Projects** — 프로젝트 카드
- **Awards** — 수상 내역
- **Contact** — 연락처

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 프레임워크 | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 언어 | TypeScript, React 19 |
| 스타일링 | Tailwind CSS 4 |
| 애니메이션 | Framer Motion, Lottie |
| 3D | Three.js, React Three Fiber, Drei |
| 배포 | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

> Node.js 20 이상 권장

## 프로젝트 구조

```
app/                 # Next.js App Router (layout, page, 글로벌 스타일)
components/
  sections/          # 페이지 섹션 (Hero, About, Skills, Projects, Awards, Contact)
  ui/                # 재사용 UI 컴포넌트 (Navbar, ScrollReveal, HeroCanvas 등)
data/                # 콘텐츠 데이터 (projects, awards, skills)
public/              # 정적 자산 (Lottie 등)
```

콘텐츠를 수정하려면 `data/` 폴더의 `projects.ts`, `awards.ts`, `skills.ts` 파일을 편집하면 됩니다.

### Awards 텍스트 서식

`data/awards.ts`의 `description`에서 줄바꿈은 `\n`, 강조는 `**텍스트**`로 표기하면 화면에 반영됩니다.

## 배포

[Vercel](https://vercel.com)에 배포되어 있습니다. `main` 브랜치 기준으로 프로덕션이 갱신됩니다.
