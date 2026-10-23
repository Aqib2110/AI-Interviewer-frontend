import { useState } from "react";
import { toast } from "sonner";
import { Plus, User, Building2, Loader2, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/Layout";
import { CardsSkeleton, ErrorState } from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { RoleBadge } from "@/components/common/Badges";
import { workspacesService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";

function WorkspaceCard({ ws, myRole, onOpen }) {
  return (
    <button onClick={() => onOpen(ws)} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-slate-300" data-testid={`workspace-card-${ws.id}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-display text-sm font-semibold text-white">{ws.name[0]}</span>
        {myRole ? <RoleBadge role={myRole} /> : <span className="rounded border border-slate-200 px-1.5 py-px font-mono text-[10px] text-slate-500">OWNER</span>}
      </div>
      <p className="mt-4 font-semibold text-slate-900">{ws.name}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{ws.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex -space-x-2">{ws.members.slice(0, 4).map((m) => <Avatar key={m.id} name={m.name} size="xs" className="ring-2 ring-white" />)}{ws.members.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium ring-2 ring-white">+{ws.members.length - 4}</span>}</div>
        <span className="flex items-center gap-1.5 text-xs text-slate-500"><MessagesSquare className="h-3.5 w-3.5" />{ws.interviewCount} interviews</span>
      </div>
    </button>
  );
}

function CreateDialog({ open, onOpenChange, onCreated }) {
  const { orgs, context, org, can } = useSession();
  const [form, setForm] = useState({ name: "", description: "", type: context === "organization" ? "organization" : "personal", orgId: org?.id || orgs[0]?.id });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const ws = await workspacesService.create(form);
      onCreated(ws);
      toast.success(`Workspace “${ws.name}” created`);
      onOpenChange(false);
      setForm((f) => ({ ...f, name: "", description: "" }));
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="create-workspace-dialog">
        <form onSubmit={submit} noValidate>
          <DialogHeader><DialogTitle>Create workspace</DialogTitle><DialogDescription>Group interviews by team, role family or hiring campaign.</DialogDescription></DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErr(""); }} placeholder="Mobile Engineering" data-testid="workspace-name-input" />{err && <p className="text-xs text-rose-600">{err}</p>}</div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="workspace-description-input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
                  <SelectTrigger data-testid="workspace-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="personal">Personal</SelectItem>{(context === "individual" || can(role)) && <SelectItem value="organization">Organization</SelectItem>}</SelectContent>
                </Select>
              </div>
              {form.type === "organization" && (
                <div className="space-y-1.5"><Label>Organization</Label>
                  <Select value={form.orgId} onValueChange={(orgId) => setForm({ ...form, orgId })}>
                    <SelectTrigger data-testid="workspace-org-select"><SelectValue /></SelectTrigger>
                    <SelectContent>{orgs.filter((o) => o.role !== "VIEWER").map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={busy} data-testid="workspace-create-submit">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create workspace</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function WorkspacesPage() {
  const { orgs, can,role } = useSession();
  const { data, loading, error, reload, setData } = useAsync(() => workspacesService.list({ orgIds: orgs.map((o) => o.id) }), []);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const roleIn = (ws) => orgs.find((o) => o.id === ws.orgId)?.role;
  const groups = data ? [{ key: "personal", title: "Personal", icon: User, items: data.filter((w) => w.type === "personal") }, ...orgs.map((o) => ({ key: o.id, title: o.name, icon: Building2, items: data.filter((w) => w.orgId === o.id) }))] : [];

  return (
    <div data-testid="workspaces-page">
      <PageHeader title="Workspaces" description="Your personal space and every organization workspace you belong to." actions={can(role) && <Button onClick={() => setOpen(true)} data-testid="create-workspace-button"><Plus className="mr-1.5 h-4 w-4" /> New workspace</Button>} />
      {loading && <CardsSkeleton count={4} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      <div className="space-y-9">
        {groups.map((g) => (
          <section key={g.key} data-testid={`workspace-group-${g.key}`}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><g.icon className="h-4 w-4 text-slate-400" />{g.title}<span className="font-mono text-xs font-normal text-slate-400">{g.items.length}</span></h2>
            {g.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{g.items.map((ws) => <WorkspaceCard key={ws.id} ws={ws} myRole={roleIn(ws)} onOpen={setSelected} />)}</div>
            ) : <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-5 py-6 text-sm text-slate-500">No workspaces yet.</p>}
          </section>
        ))}
      </div>
      <CreateDialog open={open} onOpenChange={setOpen} onCreated={(ws) => setData((l) => [...l, ws])} />
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md" data-testid="workspace-sheet">
          {selected && (
            <>
              <SheetHeader className="text-left"><SheetTitle>{selected.name}</SheetTitle><SheetDescription>{selected.organization?.name || "Personal"} · created {formatDate(selected.createdAt)}</SheetDescription></SheetHeader>
              <p className="mt-4 text-sm text-slate-600">{selected.description}</p>
              <p className="mb-2 mt-7 font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">Members · {selected.members.length}</p>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {selected.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5"><Avatar name={m.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{m.name}</p><p className="truncate text-xs text-slate-500">{m.email}</p></div>{selected.type === "organization" && <RoleBadge role={m.role} />}</div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
