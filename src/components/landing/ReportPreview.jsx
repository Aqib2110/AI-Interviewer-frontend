import { reports } from "@/data";
import { Avatar } from "@/components/common/Avatar";
import { SkillBar } from "@/components/common/SkillBar";
import { OverallScore, StrengthsWeaknesses, RecommendationCard } from "@/components/interviews/ReportBlocks";

const r = reports.iv_1042;
const SKILLS = r.skills.filter((s) => s.name !== "Redis").map((s) => (s.name === "REST API Design" ? { ...s, name: "REST APIs" } : s));

export function ReportPreview() {
  return (
    <section id="reports" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-24 lg:py-32" data-testid="report-preview-section">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-700">Candidate report</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">A report your hiring panel will actually read.</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">Minutes after the interview ends, Intervia produces a report that explains the score — skill by skill, with evidence, strengths, gaps and a clear recommendation.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            {["Overall score with four evaluation dimensions", "Per-skill scores with written AI rationale", "Strengths, areas to improve and a recommendation", "Linked transcript and recording for every claim"].map((t) => <li key={t} className="flex gap-3"><span className="mt-2 h-1 w-3 shrink-0 bg-slate-900" />{t}</li>)}
          </ul>
        </div>
        <article className="rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)]" data-testid="landing-report-card">
          <header className="flex flex-wrap items-center gap-4 border-b border-slate-100 p-6">
            <Avatar name="Sarah Khan" size="lg" />
            <div className="flex-1"><p className="font-display text-xl font-semibold text-slate-950">Sarah Khan</p><p className="text-sm text-slate-500">Senior Backend Engineer · 42 min interview</p></div>
            <span className="font-mono text-[11px] text-slate-400">REPORT · IV_1042</span>
          </header>
          <div className="space-y-8 p-6">
            <OverallScore score={87} recommendation="strong_hire" dimensions={r.dimensions} />
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{SKILLS.map((s) => <SkillBar key={s.name} name={s.name} score={s.score} compact />)}</div>
            <StrengthsWeaknesses strengths={["Strong backend fundamentals", "Good API architecture knowledge", "Strong database understanding"]} weaknesses={["Limited discussion of distributed systems", "Could improve container orchestration knowledge"]} />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Interview summary</p>
              <p className="text-[14px] leading-7 text-slate-600">{r.summary}</p>
            </div>
            <RecommendationCard recommendation="strong_hire" note={r.recommendationNote} />
          </div>
        </article>
      </div>
    </section>
  );
}
