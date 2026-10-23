import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthShell } from "@/components/auth/AuthShell";
import { SuccessState } from "@/components/common/States";
import { authService } from "@/services";
import { useSession } from "@/context/SessionContext";

export function PasswordInput({ id, value, onChange, testId, placeholder = "••••••••" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} className="h-10 pr-10" data-testid={testId} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Toggle password visibility">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
    </div>
  );
}

function ForgotDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const send = async (e) => { e.preventDefault(); setState("loading"); await authService.requestPasswordReset(email); setState("sent"); };
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setState("idle"); }}>
      <DialogContent className="max-w-sm" data-testid="forgot-password-dialog">
        {state === "sent" ? (
          <SuccessState title="Check your inbox" description={`If an account exists for ${email || "that email"}, we've sent a reset link.`} testId="forgot-password-success" />
        ) : (
          <form onSubmit={send}>
            <DialogHeader><DialogTitle>Reset your password</DialogTitle><DialogDescription>We'll email you a link to choose a new password.</DialogDescription></DialogHeader>
            <Input type="email" className="mt-5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" data-testid="forgot-password-email-input" />
            <Button type="submit" className="mt-4 w-full" disabled={state === "loading"} data-testid="forgot-password-submit">{state === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send reset link</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [form, setForm] = useState({ email: "hannah.reyes@northwindlabs.io", password: "demo-password", remember: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await authService.login(form);
      signIn(data);
      console.log(data,"data")
      toast.success(`Welcome back, ${data?.user?.name?.split(" ")[0]}`);
      navigate("/app");
    } catch (x) {
      console.log(x,"error");
      setError(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-3xl font-semibold text-slate-950">Log in to Intervia</h1>
      <p className="mt-2 text-sm text-slate-500">Review interviews, candidate reports and recordings.</p>
      <form onSubmit={submit} className="mt-8 space-y-5" noValidate data-testid="login-form">
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="h-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email-input" /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><button type="button" onClick={() => setForgot(true)} className="text-xs font-medium text-blue-600 hover:underline" data-testid="forgot-password-link">Forgot password?</button></div>
          <PasswordInput id="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} testId="login-password-input" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600"><Checkbox checked={form.remember} onCheckedChange={(v) => setForm({ ...form, remember: !!v })} data-testid="login-remember-checkbox" /> Remember me for 30 days</label>
        {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" data-testid="login-error">{error}</p>}
        <Button type="submit" className="h-10 w-full" disabled={busy} data-testid="login-submit-button">{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Log in"}</Button>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">Demo mode: any email and password will sign you in as an organization admin.</p>
      </form>
      <p className="mt-8 text-sm text-slate-500">Don't have an account? <Link to="/signup" className="font-medium text-slate-900 underline-offset-4 hover:underline" data-testid="login-signup-link">Sign up</Link></p>
      <ForgotDialog open={forgot} onOpenChange={setForgot} />
    </AuthShell>
  );
}
