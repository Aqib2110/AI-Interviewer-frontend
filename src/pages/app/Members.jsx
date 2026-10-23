import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import { TableSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { RoleBadge } from "@/components/common/Badges";
import { InviteDialog } from "@/components/org/InviteDialog";
import { membersService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { ROLES, ROLE_META } from "@/lib/permissions";
import { formatDate } from "@/lib/format";

export default function MembersPage() {
  const { org, user } = useSession();
  const { data, loading, error, reload, setData } = useAsync(() => membersService.list(org.id), [org?.id]);
  const [invite, setInvite] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [q, setQ] = useState("");
  const isSelf = (m) => m.email === user.email;

  const patch = (m) => setData((list) => list.map((x) => (x.id === m.id ? m : x)));
  const changeRole = async (m, role) => { patch(await membersService.updateRole(m.id, role)); toast.success(`${m.name} is now ${role}`); };
  const toggleStatus = async (m) => { const next = await membersService.setStatus(m.id, m.status === "active" ? "deactivated" : "active"); patch(next); toast(`${m.name} ${next.status === "active" ? "reactivated" : "deactivated"}`); };
  const remove = async () => { await membersService.remove(removing.id); setData((l) => l.filter((x) => x.id !== removing.id)); toast(`${removing.name} removed from ${org.name}`); setRemoving(null); };
  const rows = (data || []).filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Restricted perm="members:view" title="Only Admins can manage members">
      <PageHeader eyebrow={org.name} title="Members" description="Manage who can access interviews, candidate reports and organization settings." actions={<Button onClick={() => setInvite(true)} data-testid="invite-member-button"><UserPlus className="mr-1.5 h-4 w-4" /> Invite member</Button>} />
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-slate-200 bg-white p-4" data-testid={`role-summary-${r.toLowerCase()}`}>
            <div className="flex items-center justify-between"><RoleBadge role={r} /><span className="font-display text-xl font-semibold tabular">{data ? data.filter((m) => m.role === r).length : "–"}</span></div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{ROLE_META[r].description}</p>
          </div>
        ))}
      </div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members" className="mb-4 max-w-sm bg-white" data-testid="members-search-input" />
      {loading && <TableSkeleton cols={4} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState title="No members" description="Invite your hiring team to collaborate." />}
      {data?.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" data-testid="members-table">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Joined</TableHead><TableHead className="hidden lg:table-cell">Last active</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id} data-testid={`member-row-${m.id}`}>
                  <TableCell><div className="flex items-center gap-3"><Avatar name={m.name} size="sm" /><div className="min-w-0"><p className="font-medium text-slate-900">{m.name}{isSelf(m) && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}</p><p className="truncate text-xs text-slate-500">{m.email}</p></div></div></TableCell>
                  <TableCell>
                    <Select value={m.role} onValueChange={(r) => changeRole(m, r)} disabled={isSelf(m)}>
                      <SelectTrigger className="h-8 w-[112px] font-mono text-xs" data-testid={`member-role-select-${m.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="font-mono text-xs">{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.status === "active" ? "text-emerald-700" : "text-slate-400"}`}><span className={`h-1.5 w-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />{m.status === "active" ? "Active" : "Deactivated"}</span></TableCell>
                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">{formatDate(m.joinedAt)}</TableCell>
                  <TableCell className="hidden text-xs text-slate-500 lg:table-cell">{m.lastActive}</TableCell>
                  <TableCell>
                    {!isSelf(m) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" data-testid={`member-actions-${m.id}`}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStatus(m)} data-testid={`member-toggle-status-${m.id}`}>{m.status === "active" ? "Deactivate" : "Reactivate"}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-700" onClick={() => setRemoving(m)} data-testid={`member-remove-${m.id}`}>Remove from organization</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : <ShieldCheck className="h-4 w-4 text-slate-300" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <InviteDialog open={invite} onOpenChange={setInvite} />
      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle><AlertDialogDescription>They'll lose access to all interviews and reports in {org.name}. You can invite them again later.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove} className="bg-rose-600 hover:bg-rose-700" data-testid="confirm-remove-member-button">Remove member</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Restricted>
  );
}
