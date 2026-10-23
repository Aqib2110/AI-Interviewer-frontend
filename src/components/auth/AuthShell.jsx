import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ScoreRing } from "@/components/common/ScoreRing";
import { ScoreBar } from "@/components/common/SkillBar";

const SKILLS = [["Node.js", 92], ["PostgreSQL", 88], ["System Design", 84]];

export function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_minmax(0,46%)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" data-testid="auth-logo-link"><Logo /></Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="text-xs text-slate-400">© 2026 Intervia · Demo environment — no data leaves your browser.</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-[#0B0F17] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 grid-lines" />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Create → Interview → Evaluate → Decide</p>
        <div className="relative mx-auto w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Sarah Khan</p><p className="text-xs text-slate-400">Senior Backend Engineer</p></div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">Strong Candidate</span>
          </div>
          <div className="mt-6 flex items-center gap-6">
            <ScoreRing score={87} size={96} stroke={8} dark />
            <div className="flex-1 space-y-3">
              {SKILLS.map(([n, s]) => (
                <div key={n}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{n}</span><span className="font-mono text-slate-400">{s}</span></div><ScoreBar score={s} dark /></div>
              ))}
            </div>
          </div>
        </div>
        <blockquote className="relative max-w-md">
          <p className="font-display text-xl leading-snug text-white">“We stopped debating gut feelings. Every panel now starts from the same skill-by-skill evidence.”</p>
          <p className="mt-3 text-sm text-slate-500">Illustrative quote · placeholder</p>
        </blockquote>
      </aside>
    </div>
  );
}
