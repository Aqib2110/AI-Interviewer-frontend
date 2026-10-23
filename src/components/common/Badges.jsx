import { cn } from "@/lib/utils";
import { STATUS, RECOMMENDATION } from "@/lib/format";
import { ROLE_META } from "@/lib/permissions";

const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium";

export function StatusBadge({ status, className, ...rest }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={cn(base, s.cls, className)} {...rest}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function RecommendationBadge({ value, className, ...rest }) {
  if (!value) return null;
  const r = RECOMMENDATION[value];
  return <span className={cn(base, "font-semibold", r.cls, className)} {...rest}>{r.label}</span>;
}

export function RoleBadge({ role, className }) {
  const r = ROLE_META[role];
  if (!r) return null;
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-px font-mono text-[10px] font-medium tracking-wider", r.cls, className)}>{role}</span>;
}

export function Chip({ children, className }) {
  return <span className={cn("inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700", className)}>{children}</span>;
}
