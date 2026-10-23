import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "./Login";
import { authService } from "@/services";
import { useSession } from "@/context/SessionContext";

const TYPES = {
  individual: { icon: User, title: "Individual", body: "Practice AI interviews, manage your resume and track your scores over time.", cta: "Create personal account" },
  organization: { icon: Building2, title: "Organization", body: "Run structured AI interviews for candidates and review reports with your team.", cta: "Create organization" },
};

export function SignupChooser() {
  return (
    <AuthShell>
      <h1 className="text-3xl font-semibold text-slate-950">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">How will you use Intervia? You can join or create the other type later and switch anytime.</p>
      <div className="mt-8 space-y-3">
        {Object.entries(TYPES).map(([key, t]) => (
          <Link key={key} to={`/signup/${key}`} className="group flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-slate-900" data-testid={`signup-choose-${key}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><t.icon className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block font-semibold text-slate-900">{t.title}</span><span className="mt-1 block text-sm text-slate-500">{t.body}</span></span>
            <ArrowRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-900" />
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-500">Already have an account? <Link to="/login" className="font-medium text-slate-900 hover:underline" data-testid="signup-login-link">Log in</Link></p>
    </AuthShell>
  );
}

const STEPS = { individual: ["Creating your account", "Setting up your personal workspace", "Preparing your dashboard"], organization: ["Creating your account", "Setting up your organization", "Creating default workspace", "Preparing your dashboard"] };

function Provisioning({ type, done, navigate }) {  
  return (
    <div data-testid="signup-provisioning">
      <h1 className="text-2xl font-semibold text-slate-950">{done ? "You're all set" : "Setting things up…"}</h1>
      <p className="mt-2 text-sm text-slate-500">{done ? "Your demo account is ready. Nothing was sent to a server." : "This only takes a moment."}</p>
      <ul className="mt-8 space-y-3">
        {STEPS[type].map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.25 }} className="flex items-center gap-3 text-sm text-slate-700">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>{done ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin text-slate-500" />}</span>{s}
          </motion.li>
        ))}
      </ul>
      {done && <Button className="mt-8 h-10 w-full" onClick={()=>{navigate("/login")}} data-testid="signup-enter-app-button">Enter Intervia <ArrowRight className="ml-2 h-4 w-4" /></Button>}
    </div>
  );
}

export function SignupForm({ type }) {
  const navigate = useNavigate();
  const isOrg = type === "organization";
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", organizationName: "" });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("form");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
   try {
     e.preventDefault();

   
    const err = {};
    if (!f.name.trim()) err.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = "Enter a valid email.";
    if (f.password.length < 8) err.password = "Use at least 8 characters.";
    if (f.confirm !== f.password) err.confirm = "Passwords don't match.";
    if (isOrg && !f.organizationName.trim()) err.organizationName = "Enter your organization's name.";
    setErrors(err);

     console.log(f,"f");
    if (Object.keys(err).length) return;
    setPhase("provisioning");
    await (isOrg ? authService.signupOrganization(f) : authService.signupIndividual(f));
    setPhase("done");
   }
   catch (error) {
console.error("Signup error:", error);
alert(error.message || "Signup failed");
setPhase("error");
}
  };


  const field = (k, label, props = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      {k === "password" || k === "confirm" ? <PasswordInput id={k} value={f[k]} onChange={set(k)} testId={`signup-${k}-input`} /> : <Input id={k} className="h-10" value={f[k]} onChange={set(k)} data-testid={`signup-${k}-input`} {...props} />}
      {errors[k] && <p className="text-xs text-rose-600" data-testid={`signup-${k}-error`}>{errors[k]}</p>}
    </div>
  );

  const t = TYPES[type];
  return (
    <AuthShell>
      {phase !== "form" ? <Provisioning type={type} done={phase === "done"} navigate={navigate} /> : (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"><t.icon className="h-3.5 w-3.5" />{t.title} account</span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">{isOrg ? "Set up your organization" : "Create your personal account"}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.body}</p>
          <form onSubmit={submit} className="mt-7 space-y-4" noValidate data-testid={`signup-${type}-form`}>
            {field("name", "Full name", { placeholder: "Jordan Lee" })}
            {field("email", isOrg ? "Work email" : "Email", { type: "email", placeholder: isOrg ? "you@company.com" : "you@email.com" })}
            {isOrg && field("organizationName", "Organization name", { placeholder: "Acme Robotics" })}
            <div className="grid gap-4 sm:grid-cols-2">{field("password", "Password")}{field("confirm", "Confirm password")}</div>
            <Button type="submit" className="h-10 w-full" data-testid="signup-submit-button">{t.cta}</Button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            {isOrg ? "Just for yourself? " : "Hiring for a team? "}
            <Link to={`/signup/${isOrg ? "individual" : "organization"}`} className="font-medium text-slate-900 hover:underline" data-testid="signup-switch-type-link">{isOrg ? "Create an individual account" : "Create an organization"}</Link>
          </p>
          <p className="mt-2 text-sm text-slate-500">Already have an account? <Link to="/login" className="font-medium text-slate-900 hover:underline">Log in</Link></p>
        </>
      )}
    </AuthShell>
  );
}
