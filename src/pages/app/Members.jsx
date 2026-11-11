import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PageHeader } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import {
  TableSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { RoleBadge } from "@/components/common/Badges";
import { InviteDialog } from "@/components/org/InviteDialog";
import { membersService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { ROLES, ROLE_META } from "@/lib/permissions";
import { formatDate } from "@/lib/format";

const normalizeMembership = (membership) => {
  const memberUser = membership?.user ?? {};

  return {
    id: membership?.id,
    userId: membership?.userId ?? memberUser?.id,
    organizationId: membership?.organizationId,
    name:
      memberUser?.name ??
      memberUser?.fullName ??
      memberUser?.email ??
      "Unknown member",
    email: memberUser?.email ?? "",
    role: membership?.role ?? "",
    status: memberUser?.status ?? "active",
    joinedAt: membership?.createdAt,
    lastActive: memberUser?.lastActive ?? "—",
  };
};

export default function MembersPage() {
  const { orgId, user } = useSession();

  const { data, loading, error, reload } = useAsync(
    () => membersService.list(),
    [orgId],
  );

  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const records = Array.isArray(data?.members)
      ? data.members
      : Array.isArray(data)
        ? data
        : [];

    setMembers(records.map(normalizeMembership));
  }, [data]);

  const orgName = useMemo(() => {
    const records = Array.isArray(data?.members) ? data.members : [];
    return records[0]?.organization?.name ?? "your organization";
  }, [data]);

  const isSelf = (member) =>
    String(member.userId) === String(user?.id) ||
    Boolean(member.email && member.email === user?.email);

  const patchMember = (memberId, changes) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, ...changes } : member,
      ),
    );
  };

  const changeRole = async (member, role) => {
    console.log(member,"member");
    if (member.role === role) return;

    try {
      await membersService.updateRole(member.userId, role);
      patchMember(member.id, { role });
      toast.success(`${member.name} is now ${role}`);
    } catch (err) {
      toast.error(err?.message ?? "Failed to update member role");
    }
  };

  const toggleStatus = async (member) => {
    const nextStatus =
      member.status === "active" ? "deactivated" : "active";

    try {
      await membersService.setStatus(member.id, nextStatus);
      patchMember(member.id, { status: nextStatus });

      toast.success(
        `${member.name} ${
          nextStatus === "active" ? "reactivated" : "deactivated"
        }`,
      );
    } catch (err) {
      toast.error(err?.message ?? "Failed to update member status");
    }
  };

  const remove = async () => {
    if (!removing) return;
     console.log(removing,"removing");
    try {
      await membersService.remove(removing.userId);

      setMembers((current) =>
        current.filter((member) => member.id !== removing.id),
      );

      toast.success(`${removing.name} removed from ${orgName}`);
      setRemoving(null);
    } catch (err) {
      toast.error(err?.message ?? "Failed to remove member");
    }
  };

  const rows = members.filter((member) =>
    `${member.name} ${member.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
   <>
      <PageHeader
        eyebrow={orgName}
        title="Members"
        description="Manage who can access interviews, candidate reports and organization settings."
        actions={
          <Button
            onClick={() => setInvite(true)}
            data-testid="invite-member-button"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite member
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {ROLES.map((role) => (
          <div
            key={role}
            className="rounded-xl border border-slate-200 bg-white p-4"
            data-testid={`role-summary-${role.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <RoleBadge role={role} />
              <span className="font-display text-xl font-semibold tabular">
                {data
                  ? members.filter((member) => member.role === role).length
                  : "–"}
              </span>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
              {ROLE_META[role]?.description ?? ""}
            </p>
          </div>
        ))}
      </div>

      <Input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Search members"
        className="mb-4 max-w-sm bg-white"
        data-testid="members-search-input"
      />

      {loading && <TableSkeleton cols={5} />}

      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && members.length === 0 && (
        <EmptyState
          title="No members"
          description="Invite your hiring team to collaborate."
        />
      )}

      {!loading && !error && members.length > 0 && rows.length === 0 && (
        <EmptyState
          title="No matching members"
          description="Try a different search."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white"
          data-testid="members-table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Joined
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Last active
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((member) => (
                <TableRow
                  key={member.id}
                  data-testid={`member-row-${member.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />

                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {member.name}
                          {isSelf(member) && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">
                              (you)
                            </span>
                          )}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(role) => changeRole(member, role)}
                      disabled={isSelf(member)}
                    >
                      <SelectTrigger
                        className="h-8 w-[112px] font-mono text-xs"
                        data-testid={`member-role-select-${member.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="font-mono text-xs"
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        member.status === "active"
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.status === "active"
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      />
                      {member.status === "active" ? "Active" : "Deactivated"}
                    </span>
                  </TableCell>

                  <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">
                    {member.joinedAt ? formatDate(member.joinedAt) : "—"}
                  </TableCell>

                  <TableCell className="hidden text-xs text-slate-500 lg:table-cell">
                    {member.lastActive}
                  </TableCell>

                  <TableCell>
                    {!isSelf(member) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                          data-testid={`member-actions-${member.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700"
                            onClick={() => setRemoving(member)}
                            data-testid={`member-remove-${member.id}`}
                          >
                            Remove from organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-slate-300" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteDialog open={invite} onOpenChange={setInvite} />

      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {removing?.name}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              They'll lose access to all interviews and reports in {orgName}.
              You can invite them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={remove}
              className="bg-rose-600 hover:bg-rose-700"
              data-testid="confirm-remove-member-button"
            >
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}