import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { HeroMockup } from "@/components/landing/HeroMockup";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { ReportPreview } from "@/components/landing/ReportPreview";
import { UseCases, FinalCta, Footer } from "@/components/landing/Closing";
import { useSession } from "@/context/SessionContext";

const LINKS = [["Product", "#product"], ["How it works", "#how-it-works"], ["Reports", "#reports"], ["Use cases", "#use-cases"]];

function Nav() {
  const { isAuthenticated } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        <Link to="/" data-testid="landing-logo"><Logo dark /></Link>
        <nav className="hidden gap-7 md:flex">{LINKS.map(([l, h]) => <a key={h} href={h} className="text-sm text-slate-400 transition-colors hover:text-white" data-testid={`landing-nav-${h.slice(1)}`}>{l}</a>)}</nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild size="sm" className="bg-white text-slate-950 hover:bg-slate-200" data-testid="landing-open-app"><Link to="/app">Open app</Link></Button>
          ) : (
            <>
              <Link to="/login" className="px-3 text-sm text-slate-300 hover:text-white" data-testid="landing-login-link">Log in</Link>
              <Button asChild size="sm" className="bg-white text-slate-950 hover:bg-slate-200" data-testid="landing-signup-button"><Link to="/signup">Start for free</Link></Button>
            </>
          )}
        </div>
        <button className="ml-auto text-slate-300 md:hidden" onClick={() => setOpen((o) => !o)} data-testid="landing-mobile-menu" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {open && (
        <div className="mx-4 rounded-xl border border-slate-800 bg-[#0E1422] p-4 md:hidden">
          {LINKS.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm text-slate-300">{l}</a>)}
          <div className="mt-3 grid grid-cols-2 gap-2"><Button asChild variant="outline" size="sm" className="border-slate-700 bg-transparent text-white"><Link to="/login">Log in</Link></Button><Button asChild size="sm" className="bg-white text-slate-950"><Link to="/signup">Start free</Link></Button></div>
        </div>
      )}
    </header>
  );
}

const fade = (d) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.5, ease: [0.22, 1, 0.36, 1] } });

function Hero() {
  const { isAuthenticated } = useSession();
  return (
    <section className="relative overflow-hidden bg-[#0B0F17] pb-40 pt-32 lg:pb-56 lg:pt-40" data-testid="landing-hero">
      <div className="absolute inset-0 grid-lines [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_1.08fr]">
        <div>
          <motion.p {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />AI interviewing & candidate evaluation</motion.p>
          <motion.h1 {...fade(0.06)} className="mt-6 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl" data-testid="hero-headline">
            Every candidate interviewed by AI. <span className="text-slate-500">Scored skill by skill.</span>
          </motion.h1>
          <motion.p {...fade(0.12)} className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Create a structured interview from your role and required skills. Candidates interview with an AI interviewer on camera, and your team receives a detailed report — overall score, per-skill scores, summary, transcript and recording.
          </motion.p>
          <motion.div {...fade(0.18)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-white px-6 text-slate-950 hover:bg-slate-200" data-testid="hero-create-interview-button">
              <Link to={isAuthenticated ? "/app/interviews/new" : "/signup"}>Create an Interview <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-slate-700 bg-transparent px-6 text-white hover:bg-white/5 hover:text-white" data-testid="hero-how-it-works-button">
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </motion.div>
          <motion.p {...fade(0.24)} className="mt-9 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500" data-testid="hero-trust-points">Structured interviews · Skill-based evaluation · AI-generated reports</motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

const LOOP = ["Create interview", "AI interview", "Recording + transcript", "AI evaluation", "Skill scores", "Candidate report", "Hiring decision"];

export default function LandingPage() {
  return (
    <div className="bg-white" data-testid="landing-page">
      <Nav />
      <Hero />
      <section id="product" className="relative scroll-mt-20 px-4 sm:px-6">
        <div className="mx-auto -mt-28 max-w-7xl lg:-mt-40"><ProductPreview /></div>
        <div className="mx-auto max-w-7xl py-14">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500" data-testid="product-loop">
            {LOOP.map((s, i) => <span key={s} className="flex items-center gap-3"><span className={i === LOOP.length - 1 ? "text-slate-900" : ""}>{s}</span>{i < LOOP.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}</span>)}
          </div>
        </div>
      </section>
      <HowItWorks />
      <Features />
      <ReportPreview />
      <UseCases />
      <FinalCta />
      <Footer />
    </div>
  );
}
