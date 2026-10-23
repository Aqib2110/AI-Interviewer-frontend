import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { invitationsService } from "@/services";
import { ROLES, ROLE_META } from "@/lib/permissions";
import { useSession } from "@/context/SessionContext";

export function InviteDialog({ open, onOpenChange, onInvited }) {
  const { org } = useSession();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("HR");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email address.");
    setBusy(true);
    try {
      const inv = await invitationsService.invite({ email, role, orgId: org.id });
      toast.success(`Invitation sent to ${email}`);
      onInvited?.(inv);
      setEmail(""); setErr(""); onOpenChange(false);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="invite-dialog">
        <form onSubmit={submit} noValidate>
          <DialogHeader><DialogTitle>Invite to {org?.name}</DialogTitle><DialogDescription>They'll receive an email with a link to join.</DialogDescription></DialogHeader>
          <div className="mt-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" data-testid="invite-email-input" />
              {err && <p className="text-xs text-rose-600" data-testid="invite-error">{err}</p>}
            </div>
            <RadioGroup value={role} onValueChange={setRole} className="gap-2">
              {ROLES.map((r) => (
                <label key={r} className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${role === r ? "border-slate-900 bg-slate-50" : "border-slate-200"}`} data-testid={`invite-role-${r.toLowerCase()}`}>
                  <RadioGroupItem value={r} className="mt-0.5" />
                  <span><span className="block text-sm font-medium">{ROLE_META[r].label}</span><span className="block text-xs text-slate-500">{ROLE_META[r].description}</span></span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} data-testid="invite-submit-button">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
