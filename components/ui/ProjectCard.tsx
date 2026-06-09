import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border-subtle bg-card p-6 transition-colors hover:border-accent/50 hover:bg-card-hover">
      {/* 썸네일 영역 — 이미지가 있을 때만 표시 (없으면 아예 렌더링하지 않음) */}
      {project.image && (
        <div className="mb-5 aspect-video w-full overflow-hidden rounded-lg border border-border-subtle bg-gradient-to-br from-accent/20 to-accent-purple/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          {project.period && (
            <span className="shrink-0 text-xs text-muted">
              {project.period}
            </span>
          )}
        </div>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-md bg-background px-2 py-1 text-xs text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {(project.github || project.demo) && (
          <div className="flex gap-4 text-sm">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Demo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
