import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-brand-text/10 bg-brand-surface/95 p-6 shadow-xs backdrop-blur ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}
