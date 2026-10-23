import { ThumbsUp, ThumbsDown, Sparkles, Flag } from "lucide-react";
import { ScoreRing } from "@/components/common/ScoreRing";
import { ScoreBar } from "@/components/common/SkillBar";
import { RecommendationBadge } from "@/components/common/Badges";
import { DIMENSIONS, scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OverallScore({ score, recommendation, dimensions, className }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center", className)} data-testid="overall-score-block">
      <div className="flex flex-col items-center gap-3">
        <ScoreRing score={score} size={148} stroke={11} testId="overall-score-ring" />
        <RecommendationBadge value={recommendation} data-testid="overall-recommendation" />
      </div>
      <div className="space-y-3.5">
        {DIMENSIONS.map((d) => (
          <div key={d.key} data-testid={`dimension-${d.key}`}>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="text-slate-600">{d.label}</span>
              <span className={cn("font-mono font-semibold tabular", scoreTone(dimensions[d.key]).text)}>{dimensions[d.key]}</span>
            </div>
            <ScoreBar score={dimensions[d.key]} />
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-[13px]">
          <span className="font-semibold text-slate-900">Overall</span>
          <span className="font-mono font-semibold text-slate-900">{score} / 100</span>
        </div>
      </div>
    </div>
  );
}

export function Summary({ text, generatedAt }) {
  return (
    <div data-testid="ai-summary">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-blue-700"><Sparkles className="h-3 w-3" /> AI interview summary</p>
      <p className="text-[14.5px] leading-7 text-slate-700">{text}</p>
      {generatedAt && <p className="mt-3 text-[11px] text-slate-400">Generated from the transcript and recording · {new Date(generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>}
    </div>
  );
}

export function StrengthsWeaknesses({ strengths, weaknesses }) {
  const List = ({ title, items, icon: Icon, tone, testId }) => (
    <div className="rounded-lg border border-slate-200 p-4" data-testid={testId}>
      <p className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", tone)}><Icon className="h-4 w-4" /> {title}</p>
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s} className="flex gap-2.5 text-[13.5px] text-slate-700"><span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", tone.replace("text", "bg"))} />{s}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <List title="Strengths" items={strengths} icon={ThumbsUp} tone="text-emerald-700" testId="strengths-list" />
      <List title="Areas to improve" items={weaknesses} icon={ThumbsDown} tone="text-amber-700" testId="weaknesses-list" />
    </div>
  );
}

export function RecommendationCard({ recommendation, note }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center" data-testid="recommendation-card">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white"><Flag className="h-4 w-4 text-slate-700" /></span>
      <div className="flex-1">
        <p className="text-xs text-slate-500">AI recommendation</p>
        <p className="text-sm text-slate-800">{note}</p>
      </div>
      <RecommendationBadge value={recommendation} className="self-start px-3 py-1 text-[13px] sm:self-center" />
    </div>
  );
}
