import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}