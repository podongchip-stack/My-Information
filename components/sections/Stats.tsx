import ScrollReveal from "@/components/ui/ScrollReveal";
import StatsGrid from "@/components/ui/StatsGrid";
import { getAllDatasetStats } from "@/lib/stats";

export default async function Stats() {
  const { datasets, totalDownloads } = await getAllDatasetStats();

  return (
    <section id="datasets" className="mx-auto max-w-5xl px-6 py-28">
      <ScrollReveal>
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Datasets
        </h2>
        <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent-purple" />
        <p className="mb-12 text-muted">
          Hugging Face · Kaggle 공개 데이터셋 다운로드 현황
        </p>
      </ScrollReveal>

      <StatsGrid datasets={datasets} totalDownloads={totalDownloads} />
    </section>
  );
}
