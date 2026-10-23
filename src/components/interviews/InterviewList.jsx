import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/common/Avatar";
import { StatusBadge } from "@/components/common/Badges";
import { ScorePill } from "@/components/common/ScoreRing";
import { ListSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "active", label: "Active" },
];
const matchFilter = (f, s) => f === "all" || (f === "completed" ? s === "completed" : s !== "completed");

export function InterviewList({ items, loading, error, reload, selectedId, onSelect, initialQuery = "", onCreate }) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState("all");
  const {user} = useSession();
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((i) => matchFilter(filter, i.status) && (!q || `${i.candidate.name} ${i.role} ${i.title}`.toLowerCase().includes(q)));
  }, [items, query, filter]);

  return (
    <div className="flex h-full flex-col" data-testid="interview-list">
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold text-slate-950">Interviews</h1>
          <span className="font-mono text-xs text-slate-400" data-testid="interview-list-count">{visible.length}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name or role" className="h-8 bg-slate-50 pl-8 text-[13px]" data-testid="interview-list-search-input" />
        </div>
        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-0.5">
          {FILTERS?.map((f) => (
            <button key={f?.key} onClick={() => setFilter(f?.key)} data-testid={`interview-filter-${f.key}`} className={cn("flex-1 rounded px-2 py-1 text-xs font-medium transition-colors", filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
              {f.label}
            </button>
          ))}
          <SlidersHorizontal className="mx-1.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {loading && <ListSkeleton rows={7} />}
        {error && <ErrorState error={error} onRetry={reload} className="m-2 py-8" />}
        {!loading && !error && items?.length === 0 && <EmptyState title="No interviews yet" description="Create your first interview to start evaluating candidates." action={onCreate} className="m-2 py-10" />}
        {!loading && !error && items?.length > 0 && visible.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate-500" data-testid="interview-list-no-match">No interviews match “{query}”.</p>}
        <ul className="space-y-0.5">
          {!loading &&
  visible?.map((iv, index) => (
    <li key={iv?.id ?? iv?.slug ?? `interview-${index}`}>
      <button
        onClick={() => onSelect(iv.slug)}
        data-testid={`interview-item-${iv.id ?? index}`}
        className={cn(
          "relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
          selectedId === iv.id ? "bg-slate-100" : "hover:bg-slate-50"
        )}
      >
        {selectedId === iv.id && (
          <span className="absolute left-0 top-2.5 h-[calc(100%-20px)] w-[3px] rounded-r bg-blue-600" />
        )}

        <Avatar
          name={iv?.candidate?.name || user?.name}
          size="sm"
          className="mt-0.5"
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[13.5px] font-semibold text-slate-900">
              {iv?.candidate?.name || user?.name}
            </span>
            <ScorePill score={iv?.overallScore} />
          </span>

          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {iv?.role}
          </span>

          <span className="mt-1.5 flex items-center justify-between gap-2">
            <StatusBadge
              status={iv?.status}
              className="px-2 py-0 text-[10.5px]"
            />
            <span className="font-mono text-[10.5px] text-slate-400">
              {formatShortDate(iv?.interviewDate || iv?.createdAt)}
            </span>
          </span>
        </span>
      </button>
    </li>
  ))}
        </ul>
      </div>
    </div>
  );
}
