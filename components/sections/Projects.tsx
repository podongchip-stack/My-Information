import { projects } from "@/data/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-28">
      <ScrollReveal>
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Projects
        </h2>
        <div className="mb-12 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent-purple" />
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={(i % 2) * 0.1}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
