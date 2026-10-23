import { motion } from "framer-motion";
import { scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ScoreRing({ score, size = 132, stroke = 10, caption, className, dark = false, testId }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(score);
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} data-testid={testId}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(148,163,184,0.18)" : "#EEF2F7"} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.stroke} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * (score || 0)) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display font-semibold tabular leading-none", dark ? "text-white" : "text-slate-950")} style={{ fontSize: size * 0.3 }}>
          {score ?? "—"}
        </span>
        <span className={cn("mt-1 font-mono text-[10px] tracking-wider", dark ? "text-slate-400" : "text-slate-400")}>{caption || "/ 100"}</span>
      </div>
    </div>
  );
}

export function ScorePill({ score, className }) {
  if (score == null) return <span className={cn("font-mono text-xs text-slate-400", className)}>—</span>;
  const t = scoreTone(score);
  return <span className={cn("inline-flex min-w-[2.25rem] justify-center rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tabular", t.soft, t.text, className)}>{score}</span>;
}
