import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Interview created", "Candidate interviews with AI", "Recording & transcript", "AI evaluation", "Skill & overall scores", "Report ready", "Hiring decision"];
const progressFor = (status) => ({ pending: 1, in_progress: 1, completed: 6, expired: 1 }[status] ?? 0);

export function PipelineSteps({ status, compact = false }) {
  const done = progressFor(status);
  return (
    <ol className={cn("flex gap-0", compact ? "flex-col gap-2.5" : "flex-wrap gap-y-3")} data-testid="pipeline-steps">
      {STEPS.map((label, i) => {
        const isDone = i < done;
        const isCurrent = i === done;
        const failed = status === "expired" && isCurrent;
        return (
          <li key={label} className={cn("flex items-center", !compact && "flex-1 min-w-[120px]")}>
            <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
              isDone ? "border-slate-900 bg-slate-900 text-white" : failed ? "border-rose-300 bg-rose-50 text-rose-600" : isCurrent ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>
              {isDone ? <Check className="h-3 w-3" /> : failed ? <X className="h-3 w-3" /> : i + 1}
            </span>
            <span className={cn("ml-2 text-xs", isDone ? "text-slate-700" : isCurrent ? "font-medium text-slate-900" : "text-slate-400")}>{label}</span>
            {!compact && i < STEPS.length - 1 && <span className={cn("mx-2 hidden h-px flex-1 xl:block", isDone ? "bg-slate-300" : "bg-slate-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
