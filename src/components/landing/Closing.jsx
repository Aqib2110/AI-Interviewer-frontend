import { Link } from "react-router-dom";
import { ArrowRight, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { RoleBadge } from "@/components/common/Badges";

const CASES = [
  {
    icon: Building2, key: "organization", label: "For organizations", title: "Run consistent first-round interviews across every role.",
    points: ["Workspaces per team or hiring campaign", "Shared candidate reports and recordings", "Role-based access for your hiring team"],
    extra: <div className="mt-6 flex flex-wrap gap-2">{["ADMIN", "HR", "VIEWER"].map((r) => <RoleBadge key={r} role={r} />)}</div>,
    cta: "Create an organization",
  },
  {
    icon: User, key: "individual", label: "For individuals", title: "Practice the interview before the interview.",
    points: ["Create interviews for the roles you're targeting", "Upload your resume to get tailored questions", "Review scores, feedback and your history"],
    cta: "Start a personal account",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20 bg-white py-24 lg:py-32" data-testid="use-cases-section">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-700">Who it's for</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-slate-950 sm:text-4xl">Built for hiring teams. Useful for candidates too.</h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {CASES.map((c) => (
            <article key={c.key} className="flex flex-col rounded-2xl border border-slate-200 p-8" data-testid={`use-case-${c.key}`}>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"><c.icon className="h-4 w-4" />{c.label}</span>
              <h3 className="mt-5 text-2xl font-semibold text-slate-950">{c.title}</h3>
              <ul className="mt-6 space-y-2.5 text-[15px] text-slate-600">{c.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-900" />{p}</li>)}</ul>
              {c.extra}
              <Link to={`/signup/${c.key}`} className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold text-slate-900 hover:underline" data-testid={`use-case-${c.key}-cta`}>{c.cta}<ArrowRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#0B0F17] py-24 lg:py-32" data-testid="final-cta-section">
      <div className="absolute inset-0 grid-lines" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">Make every interview count as evidence.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">Set up your first structured AI interview in a few minutes and see a full candidate report before your next hiring sync.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-white px-6 text-slate-950 hover:bg-slate-200" data-testid="final-cta-create-interview"><Link to="/signup/organization">Create an Interview</Link></Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-slate-700 bg-transparent px-6 text-white hover:bg-white/5 hover:text-white" data-testid="final-cta-start-free"><Link to="/signup">Start for Free</Link></Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [["Product", ["AI interviews", "Skill evaluation", "Reports", "Recordings"]], ["Use cases", ["Organizations", "Individuals", "Engineering hiring"]], ["Company", ["About", "Security", "Contact"]]];
  return (
    <footer className="border-t border-slate-200 bg-white py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div><Logo /><p className="mt-4 max-w-xs text-sm text-slate-500">AI-powered interviewing and candidate evaluation.</p></div>
        {cols.map(([t, items]) => (
          <div key={t}><p className="text-sm font-semibold text-slate-900">{t}</p><ul className="mt-3 space-y-2 text-sm text-slate-500">{items.map((i) => <li key={i}><a href="#features" className="hover:text-slate-900">{i}</a></li>)}</ul></div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-7xl px-6 text-xs text-slate-400">© 2026 Intervia. All rights reserved.</p>
    </footer>
  );
}
