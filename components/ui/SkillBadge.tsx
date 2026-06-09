export default function SkillBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border-subtle bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent">
      {label}
    </span>
  );
}
