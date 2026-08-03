import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  hint: string;
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ title, value, trend, hint, icon: Icon, index = 0 }: StatCardProps) {
  const positive = trend >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
            positive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
          )}
        >
          <TrendIcon className="size-3" />
          {formatPercent(trend)}
        </span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </motion.article>
  );
}