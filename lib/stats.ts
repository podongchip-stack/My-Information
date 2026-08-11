// 오픈소스 공개물 통계 — 서버 사이드에서 호출 (ISR 1시간 캐싱)
//
// Hugging Face: 공개 API, 인증 불필요 (데이터셋 + 모델 둘 다 수집)
// Kaggle: 공식 API (Basic 인증). 환경변수 KAGGLE_USERNAME / KAGGLE_KEY 필요.
//   - 키 발급: kaggle.com → Settings → API → "Create New Token" (kaggle.json 즉시 다운로드)
//   - 로컬: .env.local 에 추가 / 배포: `npx vercel env add KAGGLE_USERNAME` 등으로 등록

export type Platform = "huggingface" | "kaggle";
export type ArtifactKind = "dataset" | "model";

export const PLATFORM_LABEL: Record<Platform, string> = {
  huggingface: "Hugging Face",
  kaggle: "Kaggle",
};

export type ArtifactStat = {
  platform: Platform;
  kind: ArtifactKind;
  id: string;
  title: string;
  url: string;
  downloads: number;
  /** 공개 시각(ISO). 있으면 타임라인 그래프에 릴리즈로 표시된다 */
  createdAt?: string;
};

const HF_USER = "podongchip";
const KAGGLE_USER = "podongchip";
const REVALIDATE_SECONDS = 3600; // 1시간마다 갱신

/** repo id의 마지막 segment를 보기 좋은 제목으로 변환 */
function prettifyId(id: string) {
  return id
    .split("/")
    .pop()!
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type HFEntry = {
  id: string;
  downloadsAllTime?: number;
  downloads?: number;
  createdAt?: string;
};

async function fetchHuggingFace(kind: ArtifactKind): Promise<ArtifactStat[]> {
  const path = kind === "dataset" ? "datasets" : "models";
  try {
    const res = await fetch(
      `https://huggingface.co/api/${path}?author=${HF_USER}&expand[]=downloadsAllTime&expand[]=createdAt`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const data: HFEntry[] = await res.json();

    return data.map((d) => ({
      platform: "huggingface" as const,
      kind,
      id: d.id,
      title: prettifyId(d.id),
      url: `https://huggingface.co/${kind === "dataset" ? "datasets/" : ""}${d.id}`,
      downloads: d.downloadsAllTime ?? d.downloads ?? 0,
      createdAt: d.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function getKaggleStats(): Promise<ArtifactStat[]> {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;
  // 키가 없으면 조용히 빈 배열 (HF만 표시됨)
  if (!username || !key) return [];

  try {
    const auth = Buffer.from(`${username}:${key}`).toString("base64");
    const res = await fetch(
      `https://www.kaggle.com/api/v1/datasets/list?user=${KAGGLE_USER}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) return [];
    const data: Array<{
      ref: string;
      title?: string;
      downloadCount?: number;
      totalDownloads?: number;
      lastUpdated?: string;
    }> = await res.json();

    return data.map((d) => ({
      platform: "kaggle" as const,
      kind: "dataset" as const,
      id: d.ref,
      title: d.title || prettifyId(d.ref),
      url: `https://www.kaggle.com/datasets/${d.ref}`,
      downloads: d.downloadCount ?? d.totalDownloads ?? 0,
      createdAt: d.lastUpdated,
    }));
  } catch {
    return [];
  }
}

/**
 * 같은 데이터셋을 Hugging Face와 Kaggle 양쪽에 올린 경우 — 타임라인에서
 * 한 지점으로 묶어 플랫폼별 가지로 뻗게 한다. 플랫폼마다 slug 규칙이 달라
 * 이름으로는 자동 매칭이 안 되므로 `platform:id` 쌍을 직접 적는다.
 * 새로 양쪽에 올리면 여기에 항목을 추가하면 된다.
 */
const MIRRORED_RELEASES: { title: string; keys: string[] }[] = [
  {
    title: "KOSPI Daily Stock Features 2021–2026",
    keys: [
      "huggingface:podongchip/kospi-daily-stock-features-2021-2026",
      "kaggle:podongchip/korean-stock-daily-prices-indicators-20212026",
    ],
  },
  {
    title: "Korean AI Prompt Style Dataset",
    keys: [
      "huggingface:podongchip/korean-ai-prompt-style-dataset",
      "kaggle:podongchip/korean-ai-prompt-style-dataset-by-llm",
    ],
  },
  {
    title: "Korean Synthetic Industry News",
    keys: [
      "huggingface:podongchip/korean-synthetic-industry-news",
      "kaggle:podongchip/korean-synthetic-industry-news",
    ],
  },
];

/** 타임라인의 릴리즈 노드 하나 — 같은 공개물의 플랫폼별 배포를 묶는다 */
export type ReleaseGroup = {
  key: string;
  title: string;
  kind: ArtifactKind;
  /** 가장 먼저 공개한 시각(ISO) — 타임라인 위치 기준 */
  createdAt: string;
  /** 다운로드 많은 순 */
  sources: ArtifactStat[];
  /** 플랫폼 합계 */
  downloads: number;
};

const artifactKey = (a: ArtifactStat) => `${a.platform}:${a.id}`;

/** 공개 날짜가 있는 공개물을 릴리즈 그룹으로 묶는다. 짝이 없으면 1개짜리 그룹 */
export function groupArtifacts(artifacts: ArtifactStat[]): ReleaseGroup[] {
  const groups = new Map<string, ReleaseGroup>();

  for (const a of artifacts) {
    if (!a.createdAt) continue;
    const mirror = MIRRORED_RELEASES.find((m) =>
      m.keys.includes(artifactKey(a))
    );
    const key = mirror ? mirror.keys[0] : artifactKey(a);
    const found = groups.get(key);

    if (found) {
      found.sources.push(a);
      found.downloads += a.downloads;
      if (a.createdAt < found.createdAt) found.createdAt = a.createdAt;
      continue;
    }

    groups.set(key, {
      key,
      title: mirror ? mirror.title : a.title,
      kind: a.kind,
      createdAt: a.createdAt,
      sources: [a],
      downloads: a.downloads,
    });
  }

  const list = [...groups.values()];
  for (const g of list) g.sources.sort((x, y) => y.downloads - x.downloads);
  return list;
}

/** ISR 재생성 시각 — 라이브 수치 옆에 기준일로 표기한다 */
export function asOfDate(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export async function getOpenSourceStats(): Promise<{
  artifacts: ArtifactStat[];
  totalDownloads: number;
}> {
  const [datasets, models, kaggle] = await Promise.all([
    fetchHuggingFace("dataset"),
    fetchHuggingFace("model"),
    getKaggleStats(),
  ]);

  const artifacts = [...datasets, ...models, ...kaggle].sort(
    (a, b) => b.downloads - a.downloads
  );
  const totalDownloads = artifacts.reduce((sum, a) => sum + a.downloads, 0);
  return { artifacts, totalDownloads };
}
