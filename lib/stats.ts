// 데이터셋 다운로드 통계 — 서버 사이드에서 호출 (ISR 1시간 캐싱)
//
// Hugging Face: 공개 API, 인증 불필요
// Kaggle: 공식 API (Basic 인증). 환경변수 KAGGLE_USERNAME / KAGGLE_KEY 필요.
//   - 키 발급: kaggle.com → Settings → API → "Create New Token" (kaggle.json 즉시 다운로드)
//   - 로컬: .env.local 에 추가 / 배포: `npx vercel env add KAGGLE_USERNAME` 등으로 등록

export type DatasetStat = {
  platform: "huggingface" | "kaggle";
  id: string;
  title: string;
  url: string;
  downloads: number;
};

const HF_USER = "podongchip";
const KAGGLE_USER = "podongchip";
const REVALIDATE_SECONDS = 3600; // 1시간마다 갱신

// repo id의 마지막 segment를 보기 좋은 제목으로 변환 (fallback용)
function prettifyId(id: string) {
  return id
    .split("/")
    .pop()!
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getHuggingFaceStats(): Promise<DatasetStat[]> {
  try {
    const res = await fetch(
      `https://huggingface.co/api/datasets?author=${HF_USER}&expand[]=downloadsAllTime`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const data: Array<{
      id: string;
      downloadsAllTime?: number;
      downloads?: number;
    }> = await res.json();

    return data.map((d) => ({
      platform: "huggingface" as const,
      id: d.id,
      title: prettifyId(d.id),
      url: `https://huggingface.co/datasets/${d.id}`,
      downloads: d.downloadsAllTime ?? d.downloads ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getKaggleStats(): Promise<DatasetStat[]> {
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
      id: d.ref,
      title: d.title || prettifyId(d.ref),
      url: `https://www.kaggle.com/datasets/${d.ref}`,
      downloads: d.downloadCount ?? d.totalDownloads ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getAllDatasetStats(): Promise<{
  datasets: DatasetStat[];
  totalDownloads: number;
}> {
  const [hf, kaggle] = await Promise.all([
    getHuggingFaceStats(),
    getKaggleStats(),
  ]);
  const datasets = [...hf, ...kaggle].sort((a, b) => b.downloads - a.downloads);
  const totalDownloads = datasets.reduce((sum, d) => sum + d.downloads, 0);
  return { datasets, totalDownloads };
}
