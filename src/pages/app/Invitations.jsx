import { useState } from "react";
import { toast } from "sonner";
import { MailPlus, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import {
  TableSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/common/States";
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
  const { orgId, org } = useSession();
  const { data, loading, error, reload } = useAsync(
    () => invitationsService.list(),
    [orgId],
  );
  console.log(data,"data");

  const [tab, setTab] = useState("pending");
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState(null);

  // const invitationList = invitations ?? data ?? [];
    const invitationList = [];


  const patch = (inv) => {
    setInvitations((current) =>
      (current ?? data ?? []).map((item) =>
        item.id === inv.id ? inv : item,
      ),
    );
  };

  const rows = invitationList?.filter(
    (inv) =>
      tab === "all" ||
      (tab === "pending"
        ? inv.status === "pending"
        : inv.status !== "pending"),
  );

  const count = (status) =>
    invitationList?.filter((inv) =>
      status === "pending"
        ? inv.status === "pending"
        : inv.status !== "pending",
    ).length;

  const handleInvited = (inv) => {
    setInvitations((current) => [inv, ...(current ?? data ?? [])]);
    setTab("pending");
  };

  const handleResend = async (inv) => {
    try {
      const updated = await invitationsService.resend(inv.id);
      patch({ ...updated, status: "pending" });
      toast.success(`Invitation re-sent to ${inv.email}`);
    } catch {
      toast.error("Failed to resend invitation");
    }
  };

  const handleCopyLink = async (inv) => {
    try {
      await navigator.clipboard.writeText(
        `https://intervia.app/join/${inv.id}`,
      );
      toast.success("Invite link copied");
    } catch {
      toast.error("Failed to copy invite link");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={org?.name ?? "Organization"}
        title="Invitations"
        description="Track invitations sent to your organization and the roles assigned to each invitee."
        actions={
          <Button
            onClick={() => setOpen(true)}
            data-testid="new-invitation-button"
          >
            <MailPlus className="mr-1.5 h-4 w-4" />
            New invitation
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger
            value="pending"
            data-testid="invitations-tab-pending"
          >
            Pending
            <span className="ml-1.5 font-mono text-[11px] text-slate-400">
              {count("pending")}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="history"
            data-testid="invitations-tab-history"
          >
            Accepted & expired
            <span className="ml-1.5 font-mono text-[11px] text-slate-400">
              {count("history")}
            </span>
          </TabsTrigger>

          <TabsTrigger value="all" data-testid="invitations-tab-all">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && <TableSkeleton cols={5} />}

      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon={Mail}
          title="No invitations here"
          description="Invite a teammate to collaborate on interviews and reports."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Invite someone
            </Button>
          }
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white"
          data-testid="invitations-table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Created
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Expires
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Created by
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((inv) => (
                <TableRow
                  key={inv.id}
                  data-testid={`invitation-row-${inv.id}`}
                >
                  <TableCell className="font-medium text-slate-900">
                    {inv.email}
                  </TableCell>

                  <TableCell>
                    <RoleBadge role={inv.role} />
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS[String(inv.status).toLowerCase()] ??
                        STATUS.expired
                      }`}
                    >
                      {String(inv.status).toLowerCase()}
                    </span>
                  </TableCell>

                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">
                    {formatDate(inv.createdAt)}
                  </TableCell>

                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">
                    {formatDate(inv.expiresAt)}
                  </TableCell>

                  <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                    {inv.User?.name ??
                      inv.User?.email ??
                      inv.createdBy ??
                      "—"}
                  </TableCell>

                  <TableCell>
                    {(inv.status === "pending" ||
                      inv.status === "expired") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                          data-testid={`invitation-actions-${inv.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleResend(inv)}
                            data-testid={`invitation-resend-${inv.id}`}
                          >
                            Resend invitation
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleCopyLink(inv)}
                          >
                            Copy invite link
                          </DropdownMenuItem>
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

      <InviteDialog
        open={open}
        onOpenChange={setOpen}
        onInvited={handleInvited}
      />
    </>
  );
}