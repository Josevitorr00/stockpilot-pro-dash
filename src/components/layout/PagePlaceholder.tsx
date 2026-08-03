import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  step: string;
}

export function PagePlaceholder({ title, description, icon: Icon, step }: PagePlaceholderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
    >
      <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      <p className="mt-6 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {step}
      </p>
    </motion.section>
  );
}