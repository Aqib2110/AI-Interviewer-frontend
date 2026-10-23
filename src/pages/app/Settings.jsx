import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Monitor, Smartphone, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/common/Layout";
import { Avatar } from "@/components/common/Avatar";
import { RoleBadge } from "@/components/common/Badges";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

function Section({ id, title, description, children, footer, danger }) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-xl border bg-white", danger ? "border-rose-200" : "border-slate-200")} data-testid={`settings-section-${id}`}>
      <div className="border-b border-slate-100 px-6 py-5"><h2 className={cn("text-base font-semibold", danger ? "text-rose-700" : "text-slate-900")}>{title}</h2><p className="mt-0.5 text-sm text-slate-500">{description}</p></div>
      <div className="space-y-5 px-6 py-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">{footer}</div>}
    </section>
  );
}

const Row = ({ label, children, hint }) => (
  <div className="grid gap-2 md:grid-cols-[200px_1fr] md:items-center"><div><Label className="text-[13px] text-slate-700">{label}</Label>{hint && <p className="text-xs text-slate-400">{hint}</p>}</div><div className="max-w-md">{children}</div></div>
);

function SaveButton({ id, label = "Save changes" }) {
  const [busy, setBusy] = useState(false);
  const save = () => { setBusy(true); setTimeout(() => { setBusy(false); toast.success("Settings saved"); }, 700); };
  return <Button size="sm" onClick={save} disabled={busy} data-testid={`save-${id}-button`}>{busy && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}{label}</Button>;
}

function Toggle({ id, label, description, defaultChecked }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div><p className="text-sm font-medium text-slate-800">{label}</p><p className="text-xs text-slate-500">{description}</p></div>
      <Switch defaultChecked={defaultChecked} onCheckedChange={(v) => toast(`${label} ${v ? "enabled" : "disabled"}`)} data-testid={`toggle-${id}`} />
    </div>
  );
}

function DangerZone() {
  const { context, org, signOut, can } = useSession();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const [typed, setTyped] = useState("");
  const isOrg = context === "organization";
  const actions = isOrg
    ? [{ key: "leave", title: `Leave ${org.name}`, body: "You'll lose access to this organization's interviews and reports.", cta: "Leave organization" }, ...(can("org:delete") ? [{ key: "delete-org", title: `Delete ${org.name}`, body: "Permanently delete the organization, all interviews, recordings and reports.", cta: "Delete organization", word: org.name }] : [])]
    : [{ key: "delete-account", title: "Delete account", body: "Permanently delete your account, resume and personal interview history.", cta: "Delete account", word: "DELETE" }];
  const run = () => { toast.success(`${confirm.cta} — simulated`, { description: "No data was changed in this demo." }); if (confirm.key === "delete-account") { signOut(); navigate("/"); } setConfirm(null); setTyped(""); };
  return (
    <Section id="danger" title="Danger zone" description="Irreversible and destructive actions." danger>
      {actions.map((a) => (
        <div key={a.key} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium text-slate-900">{a.title}</p><p className="text-xs text-slate-500">{a.body}</p></div>
          <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setConfirm(a)} data-testid={`danger-${a.key}-button`}>{a.cta}</Button>
        </div>
      ))}
      <AlertDialog open={!!confirm} onOpenChange={(o) => { if (!o) { setConfirm(null); setTyped(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-600" />{confirm?.title}?</AlertDialogTitle><AlertDialogDescription>{confirm?.body}</AlertDialogDescription></AlertDialogHeader>
          {confirm?.word && <div className="space-y-1.5"><Label className="text-xs">Type <span className="font-mono font-semibold">{confirm.word}</span> to confirm</Label><Input value={typed} onChange={(e) => setTyped(e.target.value)} data-testid="danger-confirm-input" /></div>}
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={confirm?.word && typed !== confirm.word} onClick={run} className="bg-rose-600 hover:bg-rose-700" data-testid="danger-confirm-button">{confirm?.cta}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

export default function SettingsPage() {
  const { user, org, role, context, can, updateUser } = useSession();
  const isOrg = context === "organization";
  const [name, setName] = useState(user.name);
  const nav = [["profile", "Profile"], ["account", "Account"], ...(isOrg ? [["organization", "Organization"]] : []), ["security", "Security"], ["notifications", "Notifications"], ["billing", "Billing"], ["danger", "Danger zone"]];
  const orgLocked = !can("org:settings");

  return (
    <div data-testid="settings-page">
      <PageHeader eyebrow={isOrg ? org.name : "Personal account"} title="Settings" description="Manage your profile, security and organization preferences." />
      <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:sticky lg:top-24 lg:flex-col lg:self-start">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-white hover:text-slate-900" data-testid={`settings-nav-${id}`}>{label}</a>)}
        </nav>
        <div className="max-w-3xl space-y-6">
          <Section id="profile" title="Profile" description="How you appear to teammates and candidates." footer={<Button size="sm" onClick={() => { updateUser({ name }); toast.success("Profile updated"); }} data-testid="save-profile-button">Save profile</Button>}>
            <Row label="Photo"><div className="flex items-center gap-3"><Avatar name={name} size="lg" /><Button variant="outline" size="sm" onClick={() => toast("Photo upload will be available once storage is connected")}>Change</Button></div></Row>
            <Row label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} data-testid="settings-name-input" /></Row>
            <Row label="Job title"><Input defaultValue={user.title} /></Row>
            <Row label="Location"><Input defaultValue={user.location} /></Row>
          </Section>
          <Section id="account" title="Account" description="Sign-in email and regional preferences." footer={<SaveButton id="account" />}>
            <Row label="Email"><Input defaultValue={user.email} type="email" data-testid="settings-email-input" /></Row>
            <Row label="Time zone"><Select defaultValue="tor"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tor">{user.timezone}</SelectItem><SelectItem value="lon">Europe/London (GMT+1)</SelectItem><SelectItem value="dxb">Asia/Dubai (GMT+4)</SelectItem></SelectContent></Select></Row>
            <Row label="Language"><Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English (US)</SelectItem><SelectItem value="en-gb">English (UK)</SelectItem></SelectContent></Select></Row>
          </Section>
          {isOrg && (
            <Section id="organization" title="Organization" description={orgLocked ? "Only Admins can edit organization settings." : "Details shown on candidate invitations."} footer={!orgLocked && <SaveButton id="organization" />}>
              <Row label="Your role"><RoleBadge role={role} /></Row>
              <Row label="Organization name"><Input defaultValue={org.name} disabled={orgLocked} data-testid="settings-org-name-input" /></Row>
              <Row label="Email domain" hint="Members with this domain can request to join"><Input defaultValue={org.domain} disabled={orgLocked} /></Row>
              <Row label="Company size"><Select defaultValue={org.size} disabled={orgLocked}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["1–10", "11–50", "51–200", "201–500", "500+"].map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}</SelectContent></Select></Row>
              <Row label="Default interview length"><Select defaultValue="40" disabled={orgLocked}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["25", "40", "60"].map((m) => <SelectItem key={m} value={m}>{m} minutes</SelectItem>)}</SelectContent></Select></Row>
            </Section>
          )}
          <Section id="security" title="Security" description="Password, two-factor authentication and active sessions." footer={<SaveButton id="security" label="Update password" />}>
            <Row label="Current password"><Input type="password" placeholder="••••••••" /></Row>
            <Row label="New password" hint="At least 8 characters"><Input type="password" placeholder="••••••••" /></Row>
            <Toggle id="2fa" label="Two-factor authentication" description="Require a code from your authenticator app at sign-in." defaultChecked />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">Active sessions</p>
              {[[Monitor, "Chrome on macOS · Toronto", "Current session"], [Smartphone, "Safari on iPhone · Toronto", "Active 2 days ago"]].map(([I, d, t]) => (
                <div key={d} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><I className="h-4 w-4 text-slate-400" /><div className="flex-1"><p className="text-sm text-slate-800">{d}</p><p className="text-xs text-slate-500">{t}</p></div>{t !== "Current session" && <Button variant="ghost" size="sm" onClick={() => toast("Session signed out")}>Sign out</Button>}</div>
              ))}
            </div>
          </Section>
          <Section id="notifications" title="Notifications" description="Choose what Intervia emails you about.">
            <Toggle id="report-ready" label="Report ready" description="When an AI evaluation report is generated." defaultChecked />
            <Toggle id="interview-started" label="Interview started" description="When a candidate begins an interview." defaultChecked />
            <Toggle id="link-expiring" label="Link expiring" description="24 hours before an unused interview link expires." />
            <Toggle id="weekly-digest" label="Weekly hiring digest" description="Summary of interviews, scores and pending decisions." defaultChecked />
          </Section>
          <Section id="billing" title="Billing" description="Plan and usage. Payments will be connected later.">
            <div className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center" data-testid="billing-placeholder">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <div className="flex-1"><p className="text-sm font-semibold text-slate-900">{isOrg ? `${org.plan} plan · ${org.seatsUsed}/${org.seats} seats` : "Free personal plan"}</p><p className="text-xs text-slate-500">{isOrg ? "38 of 120 AI interviews used this billing cycle · renews Nov 1, 2026" : "5 practice interviews per month"}</p></div>
              <Button variant="outline" size="sm" disabled>Manage billing</Button>
            </div>
          </Section>
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
