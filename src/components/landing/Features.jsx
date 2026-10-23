import { MessagesSquare, BarChart3, FileText, PlayCircle, ListChecks, UserRound } from "lucide-react";
import { ScoreBar } from "@/components/common/SkillBar";

const FEATURES = [
  { icon: MessagesSquare, title: "AI-powered interviews", body: "Questions are generated from the role description and required skills, with follow-ups that adapt to each answer — not a generic chatbot script.", visual: <div className="space-y-1.5 text-[12px]"><p className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">Design a multi-tenant API…</p><p className="ml-6 rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">Follow-up: how do you isolate tenant data?</p></div> },
  { icon: BarChart3, title: "Skill-based evaluation", body: "Each required skill gets its own 0–100 score and a written rationale, so you can see exactly where a candidate is strong.", visual: <div className="space-y-2">{[["Node.js", 92], ["PostgreSQL", 88], ["Docker", 79]].map(([n, s]) => <div key={n} className="flex items-center gap-3 text-[12px]"><span className="w-20 text-slate-600">{n}</span><ScoreBar score={s} /><span className="font-mono text-slate-500">{s}</span></div>)}</div> },
  { icon: FileText, title: "Detailed candidate reports", body: "Summary, strengths, weaknesses and a recommendation your hiring panel can read in two minutes and act on." },
  { icon: PlayCircle, title: "Interview recordings", body: "Watch the full interview with chapters and a synced transcript. Jump straight to the answer behind any score." },
  { icon: ListChecks, title: "Structured hiring", body: "Every candidate for a role answers against the same requirements, so comparisons are consistent and defensible." },
  { icon: UserRound, title: "Individual interviews", body: "Developers and job seekers can run practice interviews, keep a resume on file and track their scores over time." },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white py-24 lg:py-32" data-testid="features-section">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-700">Platform</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">An interviewer, an evaluator and a review tool — in one product.</h2>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-600 lg:pb-1">Intervia isn't a chat window bolted onto your ATS. It runs the interview, records it, evaluates it against your requirements and hands your team a report built for decisions.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="flex flex-col bg-white p-7 transition-colors hover:bg-slate-50/70" data-testid={`feature-${f.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <f.icon className="h-5 w-5 text-slate-900" />
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              {f.visual && <div className="mt-6">{f.visual}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
