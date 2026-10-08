import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="bg-brand-champagne/50 p-5 border border-brand-border rounded-2xl">
      <header className="space-y-1">
        <h3 className="font-semibold text-brand-text text-sm">{title}</h3>
        {description ? (
          <p className="text-brand-muted text-xs">{description}</p>
        ) : null}
      </header>
      <div className="gap-4 grid md:grid-cols-2 mt-4">{children}</div>
    </section>
  );
}
