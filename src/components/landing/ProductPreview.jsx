import { useState } from "react";
import { Search, LayoutGrid, MessagesSquare, Users, Settings } from "lucide-react";
import { interviews, candidates, reports } from "@/data";
import { Avatar } from "@/components/common/Avatar";
import { StatusBadge, RecommendationBadge } from "@/components/common/Badges";
import { ScoreRing, ScorePill } from "@/components/common/ScoreRing";
import { SkillBar } from "@/components/common/SkillBar";
import { DIMENSIONS, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROWS = interviews.filter((i) => i.context === "organization").slice(0, 8).map((i) => ({ ...i, candidate: candidates.find((c) => c.id === i.candidateId) }));

export function ProductPreview() {
  const [sel, setSel] = useState("iv_1042");
  const iv = ROWS.find((r) => r.id === sel);
  const rep = reports[sel];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.35)]" data-testid="landing-product-preview">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-slate-300" />)}</span>
        <span className="mx-auto flex h-6 w-full max-w-sm items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-400"><Search className="h-3 w-3" />Search interviews, candidates, roles…<kbd className="ml-auto font-mono text-[10px]">⌘K</kbd></span>
      </div>
      <div className="grid min-h-[560px] grid-cols-[52px_1fr] md:grid-cols-[52px_250px_1fr]">
        <div className="flex flex-col items-center gap-2 border-r border-slate-200 py-4">
          {[LayoutGrid, MessagesSquare, Users, Settings].map((I, i) => <span key={i} className={cn("flex h-8 w-8 items-center justify-center rounded-md", i === 1 ? "bg-slate-900 text-white" : "text-slate-400")}><I className="h-4 w-4" /></span>)}
        </div>
        <div className="hidden border-r border-slate-200 md:block">
          <p className="px-4 pb-2 pt-4 text-sm font-semibold text-slate-900">Interviews</p>
          {ROWS.map((r) => (
            <button key={r.id} onClick={() => reports[r.id] && setSel(r.id)} className={cn("flex w-full items-center gap-2.5 px-4 py-2.5 text-left", sel === r.id ? "bg-slate-100" : "hover:bg-slate-50", !reports[r.id] && "cursor-default")} data-testid={`preview-row-${r.id}`}>
              <Avatar name={r.candidate.name} size="xs" />
              <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-medium text-slate-900">{r.candidate.name}</span><span className="block truncate text-[11px] text-slate-500">{r.role}</span></span>
              <span className="flex flex-col items-end gap-1"><ScorePill score={r.overallScore} className="text-[10.5px]" /><span className="font-mono text-[9.5px] text-slate-400">{formatShortDate(r.interviewDate || r.createdAt)}</span></span>
            </button>
          ))}
        </div>
        <div className="min-w-0 bg-slate-50/60 p-5 lg:p-7">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <Avatar name={iv.candidate.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="font-display text-xl font-semibold text-slate-950">{iv.candidate.name}</p><StatusBadge status={iv.status} /></div>
              <p className="text-sm text-slate-500">{iv.role} · {iv.durationMin} min · {formatShortDate(iv.interviewDate)}</p>
            </div>
            <div className="flex items-center gap-3"><ScoreRing score={iv.overallScore} size={78} stroke={7} key={sel} /><RecommendationBadge value={iv.recommendation} /></div>
          </div>
          <div className="mt-3 flex gap-1 overflow-hidden text-[12px]">{["Overview", "Skills", "Interview", "Report", "Recording"].map((t, i) => <span key={t} className={cn("rounded-md px-2.5 py-1", i === 0 ? "bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500")}>{t}</span>)}</div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-[13px] font-semibold text-slate-900">Skill evaluation</p>
              <div className="space-y-3">{rep.skills.slice(0, 5).map((s) => <SkillBar key={sel + s.name} name={s.name} score={s.score} compact />)}</div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-[13px] font-semibold text-slate-900">AI summary</p>
                <p className="line-clamp-4 text-[13px] leading-relaxed text-slate-600">{rep.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DIMENSIONS.map((d) => <div key={d.key} className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[11px] text-slate-500">{d.label}</p><p className="font-display text-xl font-semibold tabular text-slate-950">{rep.dimensions[d.key]}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
