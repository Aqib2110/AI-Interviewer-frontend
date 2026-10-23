import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-[28px]" data-testid="page-title">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName, testId }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white", className)} data-testid={testId}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, suffix, hint, icon: Icon, index = 0, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-5" data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular text-slate-950">
        {value}{suffix && <span className="ml-1 text-base font-normal text-slate-400">{suffix}</span>}
      </p>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}

export function KeyValue({ label, children, icon: Icon }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-slate-500">{Icon && <Icon className="h-3.5 w-3.5" />}{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}
