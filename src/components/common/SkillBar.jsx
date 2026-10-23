import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { scoreTone, slug } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ScoreBar({ score, className, dark = false }) {
  const t = scoreTone(score);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", dark ? "bg-slate-800" : "bg-slate-100", className)}>
      <motion.div className={cn("h-full rounded-full", t.bar)} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

export function SkillBar({ name, score, explanation, defaultOpen = false, compact = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const t = scoreTone(score);
  const expandable = !!explanation && !compact;
  return (
    <div className={cn("group", !compact && "rounded-lg border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-slate-300")} data-testid={`skill-bar-${slug(name)}`}>
      <button type="button" disabled={!expandable} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 text-left disabled:cursor-default">
        <span className={cn("min-w-0 flex-1 truncate font-medium text-slate-800", compact ? "text-[13px]" : "text-sm")}>{name}</span>
        <span className={cn("font-mono text-sm font-semibold tabular", t.text)}>
          {score}<span className="text-xs font-normal text-slate-400"> / 100</span>
        </span>
        {expandable && <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />}
      </button>
      <ScoreBar score={score} className="mt-2.5" />
      <AnimatePresence initial={false}>
        {expandable && open && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <span className="mt-3 flex gap-2 text-[13px] leading-relaxed text-slate-600">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              {explanation}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
