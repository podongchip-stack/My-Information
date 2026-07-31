// 오픈소스 공개물 통계 — 서버 사이드에서 호출 (ISR 1시간 캐싱)
//
// Hugging Face: 공개 API, 인증 불필요 (데이터셋 + 모델 둘 다 수집)
// Kaggle: 공식 API (Basic 인증). 환경변수 KAGGLE_USERNAME / KAGGLE_KEY 필요.
//   - 키 발급: kaggle.com → Settings → API → "Create New Token" (kaggle.json 즉시 다운로드)
//   - 로컬: .env.local 에 추가 / 배포: `npx vercel env add KAGGLE_USERNAME` 등으로 등록

export type Platform = "huggingface" | "kaggle";
export type ArtifactKind = "dataset" | "model";

export type ArtifactStat = {
  platform: Platform;
  kind: ArtifactKind;
  id: string;
  title: string;
  url: string;
  downloads: number;
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
};

async function fetchHuggingFace(kind: ArtifactKind): Promise<ArtifactStat[]> {
  const path = kind === "dataset" ? "datasets" : "models";
  try {
    const res = await fetch(
      `https://huggingface.co/api/${path}?author=${HF_USER}&expand[]=downloadsAllTime`,
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
    }> = await res.json();

    return data.map((d) => ({
      platform: "kaggle" as const,
      kind: "dataset" as const,
      id: d.ref,
      title: d.title || prettifyId(d.ref),
      url: `https://www.kaggle.com/datasets/${d.ref}`,
      downloads: d.downloadCount ?? d.totalDownloads ?? 0,
    }));
  } catch {
    return [];
  }
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
