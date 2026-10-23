import { AlertTriangle, CheckCircle2, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon = Inbox, title, description, action, className, testId = "empty-state" }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center", className)} data-testid={testId}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500"><Icon className="h-5 w-5" /></span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center", className)} data-testid="error-state">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600"><AlertTriangle className="h-5 w-5" /></span>
      <h3 className="text-base font-semibold text-slate-900">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-600">{error?.message || "An unexpected error occurred."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} data-testid="error-retry-button">
          <RotateCw className="mr-2 h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

export function SuccessState({ title, description, children, testId = "success-state" }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center" data-testid={testId}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50"><CheckCircle2 className="h-6 w-6" /></span>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export const ListSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2" data-testid="list-skeleton">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-2.5 w-1/2" /></div>
        <Skeleton className="h-5 w-8" />
      </div>
    ))}
  </div>
);

export const CardsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="cards-skeleton">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="h-3 w-24" /><Skeleton className="mt-4 h-8 w-16" /><Skeleton className="mt-3 h-2.5 w-32" /></div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" data-testid="table-skeleton">
    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3"><Skeleton className="h-3 w-40" /></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-6 border-b border-slate-100 px-5 py-4 last:border-0">
        <Skeleton className="h-8 w-8 rounded-full" />
        {Array.from({ length: cols }).map((__, j) => <Skeleton key={j} className="h-3 flex-1" />)}
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6" data-testid="detail-skeleton">
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2.5"><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-72" /></div>
      <Skeleton className="h-24 w-24 rounded-full" />
    </div>
    <Skeleton className="h-9 w-96" />
    <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
  </div>
);
