import { useState } from "react";
import { toast } from "sonner";
import { MailPlus, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import { TableSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { RoleBadge } from "@/components/common/Badges";
import { InviteDialog } from "@/components/org/InviteDialog";
import { invitationsService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";

const STATUS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  revoked: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function InvitationsPage() {
  const { org } = useSession();
  const { data, loading, error, reload, setData } = useAsync(() => invitationsService.list(org.id), [org?.id]);
  const [tab, setTab] = useState("pending");
  const [open, setOpen] = useState(false);
  const patch = (inv) => setData((l) => l.map((x) => (x.id === inv.id ? inv : x)));
  const rows = (data || []).filter((i) => tab === "all" || (tab === "pending" ? i.status === "pending" : i.status !== "pending"));
  const count = (s) => (data || []).filter((i) => (s === "pending" ? i.status === "pending" : i.status !== "pending")).length;

  return (
    <Restricted perm="invitations:manage" title="Only Admins can manage invitations">
      <PageHeader eyebrow={org.name} title="Invitations" description="Track who has been invited to your organization and with which role." actions={<Button onClick={() => setOpen(true)} data-testid="new-invitation-button"><MailPlus className="mr-1.5 h-4 w-4" /> New invitation</Button>} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending" data-testid="invitations-tab-pending">Pending <span className="ml-1.5 font-mono text-[11px] text-slate-400">{count("pending")}</span></TabsTrigger>
          <TabsTrigger value="history" data-testid="invitations-tab-history">Accepted & expired <span className="ml-1.5 font-mono text-[11px] text-slate-400">{count("history")}</span></TabsTrigger>
          <TabsTrigger value="all" data-testid="invitations-tab-all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading && <TableSkeleton cols={4} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && rows.length === 0 && <EmptyState icon={Mail} title="No invitations here" description="Invite a teammate to collaborate on interviews and reports." action={<Button size="sm" onClick={() => setOpen(true)}>Invite someone</Button>} />}
      {data && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" data-testid="invitations-table">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70"><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Sent</TableHead><TableHead className="hidden md:table-cell">Expires / responded</TableHead><TableHead className="hidden lg:table-cell">Invited by</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id} data-testid={`invitation-row-${i.id}`}>
                  <TableCell className="font-medium text-slate-900">{i.email}</TableCell>
                  <TableCell><RoleBadge role={i.role} /></TableCell>
                  <TableCell><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS[i.status]}`}>{i.status}</span></TableCell>
                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">{formatDate(i.sentAt)}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">{formatDate(i.respondedAt || i.expiresAt)}</TableCell>
                  <TableCell className="hidden text-sm text-slate-600 lg:table-cell">{i.invitedBy}</TableCell>
                  <TableCell>
                    {(i.status === "pending" || i.status === "expired") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" data-testid={`invitation-actions-${i.id}`}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={async () => { patch({ ...(await invitationsService.resend(i.id)), status: "pending" }); toast.success(`Invitation re-sent to ${i.email}`); }} data-testid={`invitation-resend-${i.id}`}>Resend invitation</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(`https://intervia.app/join/${i.id}`); toast.success("Invite link copied"); }}>Copy invite link</DropdownMenuItem>
                          {i.status === "pending" && <DropdownMenuItem className="text-rose-600 focus:text-rose-700" onClick={async () => { patch(await invitationsService.revoke(i.id)); toast(`Invitation for ${i.email} revoked`); }} data-testid={`invitation-revoke-${i.id}`}>Revoke</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <InviteDialog open={open} onOpenChange={setOpen} onInvited={(inv) => { setData((l) => [inv, ...l]); setTab("pending"); }} />
    </Restricted>
  );
}
