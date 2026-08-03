import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-9"
    >
      {children}
    </motion.div>
  );
}