import { useState,useEffect } from "react";
import { toast } from "sonner";
import { MailPlus, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {usePendingInvitations} from "@/context/PendingInvitationsContext";
import { ArrowRight, Building2, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, Users,AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
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
import {useMemo} from "react";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";
import { div } from "three/src/nodes/math/OperatorNode.js";

const STATUS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  revoked: "bg-rose-50 text-rose-600 border-rose-200",
};


export default function InvitationsPage() {
  const { orgId, org } = useSession();

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => invitationsService.list(),
    [orgId],
  );

  const [tab, setTab] = useState("pending");
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState(null);

const invitationList = useMemo(() => {
  if (Array.isArray(invitations)) return invitations;

  if (Array.isArray(data)) {
    return data.flatMap((organization) =>
      Array.isArray(organization.invitations)
        ? organization.invitations
        : []
    );
  }

  if (Array.isArray(data?.invitations)) {
    return data.invitations;
  }

  if (Array.isArray(data?.data?.invitations)) {
    return data.data.invitations;
  }

  return [];
}, [invitations, data]);

console.log(invitationList,"invitationList");
 const patch = (updatedInvitation) => {
  setInvitations((current) => {
    const list = Array.isArray(current)
      ? current
      : invitationList;

    return list.map((item) =>
      item.id === updatedInvitation.id
        ? { ...item, ...updatedInvitation }
        : item
    );
  });
};

  const rows = useMemo(() => {
    return invitationList.filter((inv) => {
      const status = String(inv.status).toLowerCase();

      if (tab === "all") return true;
      if (tab === "pending") return status === "pending";

      return ["accepted", "expired", "pending"].includes(status);
    });
  }, [invitationList, tab]);

  const count = (status) => {
    return invitationList.filter(
      (inv) => String(inv.status).toLowerCase() === status,
    ).length;
  };

  const historyCount = invitationList.filter((inv) =>
    ["accepted", "expired", "revoked"].includes(
      String(inv.status).toLowerCase(),
    ),
  ).length;

 const handleInvited = (inv) => {
  setInvitations((current) => {
    const list = Array.isArray(current)
      ? current
      : invitationList;

    return [
      inv,
      ...list.filter((item) => item.id !== inv.id),
    ];
  });

  setTab("pending");
};

  const handleResend = async (inv) => {
  try {
    const response = await invitationsService.resend(inv.id);

    const updated = response?.data?.invitation ??
      response?.invitation ??
      response?.data;

    if (!updated?.id) {
      throw new Error("Invalid resend response");
    }

    patch({
      ...updated,
      status: updated.status ?? "pending",
    });

    toast.success(`Invitation re-sent to ${inv.email}`);
  } catch (error) {
    toast.error(
      error?.response?.data?.message ??
        error?.message ??
        "Failed to resend invitation"
    );
  }
};

  const handleCopyLink = async (inv) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/invitation/${inv?.tokenHash}`,
      );

      toast.success("Invite link copied");
    } catch {
      toast.error("Failed to copy invite link");
    }
  };

  const getStatus = (status) => {
    const normalized = String(status ?? "").toLowerCase();

    return STATUS[normalized] ?? STATUS.expired;
  };

  const getCreator = (inv) => {
    return (
      inv.User?.name ??
      inv.User?.email ??
      inv.createdBy ??
      "—"
    );
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

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mb-4"
      >
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
              {historyCount}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="all"
            data-testid="invitations-tab-all"
          >
            All
            <span className="ml-1.5 font-mono text-[11px] text-slate-400">
              {invitationList.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && <TableSkeleton cols={7} />}

      {error && (
        <ErrorState
          error={error}
          onRetry={reload}
        />
      )}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon={Mail}
          title="No invitations here"
          description={
            tab === "pending"
              ? "You don't have any pending invitations."
              : "No invitation history is available."
          }
          action={
            <Button
              size="sm"
              onClick={() => setOpen(true)}
            >
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
              {rows.map((inv) => {
                const status = String(inv.status).toLowerCase();

                return (
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
                          getStatus(status)
                        }`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">
                      {formatDate(inv.createdAt)}
                    </TableCell>

                    <TableCell className="hidden font-mono text-xs text-slate-500 md:table-cell">
                      {formatDate(inv.expiresAt)}
                    </TableCell>

                    <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                      {getCreator(inv)}
                    </TableCell>

                    <TableCell>
                      {(status === "pending" ||
                        status === "expired") && (
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
                );
              })}
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







export function InvitationAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, switchOrg } = useSession();

  const [accepting, setAccepting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [invitation, setInvitation] = useState(null);

  const invitationUrl = `/invitation/accept/${token}`;

  useEffect(() => {
    let active = true;

    const checkInvitation = async () => {
      if (!token) {
        setExpired(true);
        setChecking(false);
        return;
      }

      try {
        const response = await invitationsService.getByToken(token);

        const invitationData =
          response?.data?.invitation ??
          response?.data?.data ??
          response?.data ??
          response?.invitation;

        if (!active) return;

        if (
          !invitationData?.expiresAt ||
          new Date(invitationData.expiresAt).getTime() <= Date.now()
        ) {
          setExpired(true);
          return;
        }

        setInvitation(invitationData);
      } catch (err) {
        if (!active) return;

        setExpired(true);
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkInvitation();

    return () => {
      active = false;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated || !token || accepting || expired || !invitation) {
      return;
    }

    if (new Date(invitation.expiresAt).getTime() <= Date.now()) {
      setExpired(true);
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const response = await invitationsService.accept(token);

      const membership =
        response?.data?.membership ??
        response?.membership;

        console.log(membership,"membership");

      if (membership) {
        switchOrg(membership);
      }

      setAccepted(true);

      setTimeout(() => {
        navigate("/organization", { replace: true });
      }, 1200);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 410) {
        setExpired(true);
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to accept this invitation. Please try again."
        );
      }
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/10">
            <Building2 className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Organization invitation
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You've been invited to join an organization on Intervia.
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Users className="h-5 w-5 text-slate-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  You're invited to join a team
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Accept this invitation to access your organization's
                  workspace, interviews, and team resources.
                </p>
              </div>
            </div>

            {checking ? (
              <div className="space-y-4 py-8 text-center">
                <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Checking invitation
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Please wait while we verify your invitation.
                  </p>
                </div>
              </div>
            ) : expired ? (
              <div className="space-y-4 py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Invitation expired
                  </h2>

                  <p className="text-sm leading-6 text-slate-500">
                    This invitation has expired or is no longer available.
                    Please contact your organization administrator to
                    request a new invitation.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="h-11 w-full"
                >
                  Back to login
                </Button>
              </div>
            ) : accepted ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Invitation accepted!
                </h2>

                <p className="text-sm text-slate-500">
                  You have successfully joined the organization. Redirecting
                  you to your dashboard...
                </p>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Sign in to continue
                  </h2>

                  <p className="text-sm leading-6 text-slate-500">
                    Sign in with the email address that received this
                    invitation. Your invitation will remain available after
                    login.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <LockKeyhole className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Authentication required
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Log in to accept your invitation.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    navigate(
                      `/login?redirect=${encodeURIComponent(invitationUrl)}`
                    )
                  }
                  className="h-11 w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Log in to accept invitation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-slate-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() =>
                      navigate(
                        `/signup?redirect=${encodeURIComponent(invitationUrl)}`
                      )
                    }
                    className="font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Accept your invitation
                  </h2>

                  <p className="text-sm text-slate-500">
                    You're currently signed in. Continue to join the
                    organization.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Signed in as</p>

                    <p className="truncate text-sm font-medium text-slate-900">
                      {user?.email}
                    </p>
                  </div>

                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                  <p className="text-xs leading-5 text-slate-500">
                    By accepting, you agree to join this organization using
                    your currently authenticated account.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAccept}
                  disabled={accepting || !token || !invitation}
                  className="h-11 w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  {accepting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Accepting invitation...
                    </>
                  ) : (
                    <>
                      Accept invitation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-center">
            <p className="text-xs text-slate-400">
              Secure organization access powered by Intervia
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Need help? Contact your organization administrator.
        </p>
      </div>
    </div>
  );
}





const formatRole = (role) => {
  if (!role) return "Member";

  return String(role)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function InvitationsListPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, switchOrg } = useSession();

  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptError, setAcceptError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    loading,
    invitations,
    error,
    reload,
  } = usePendingInvitations();


  // const invitations = getInvitations(data);

  const handleAccept = async (invitation) => {
    if (!isAuthenticated || !invitation?.id || acceptingId) return;

    setAcceptingId(invitation.id);
    setAcceptError("");
    setSuccessMessage("");

    try {
      const response = await invitationsService.accept(invitation.tokenHash);

      const membership =
        response?.data?.membership ??
        response?.membership;

      if (membership) {
        switchOrg(membership);
      }

      setSuccessMessage(
        `You have successfully joined ${invitation.organization?.name || "the organization"}.`
      );

      await reload();

    } catch (err) {
      setAcceptError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to accept this invitation. Please try again."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md rounded-2xl border-slate-200 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Mail className="h-7 w-7 text-slate-700" />
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            Sign in to view invitations
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to see organization invitations sent to your email address.
          </p>

          <Button
            onClick={() =>
              navigate(
                `/login?redirect=${encodeURIComponent("/invitations")}`
              )
            }
            className="mt-6 w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            Log in
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8">
       <button
  onClick={() => navigate("/app")}
  className="inline-flex  gap-2 pb-6 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
>
  <ArrowLeft className="h-4 w-4" />
  Back to dashboard
</button>
      <div className="mx-auto max-w-4xl space-y-8">
         
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              Organization invitations
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Your invitations
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Invitations sent to {user?.email}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={reload}
            disabled={loading}
            className="border-slate-200 bg-white"
          >
            {/* <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            /> */}
            Refresh
          </Button>
        </div>

        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {successMessage}
          </div>
        )}

        {acceptError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {acceptError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="rounded-2xl border-slate-200 p-8 text-center shadow-sm">
            <p className="font-medium text-slate-900">
              Unable to load invitations
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Please try again.
            </p>
            <Button
              onClick={reload}
              className="mt-5 bg-slate-900 text-white hover:bg-slate-800"
            >
              Try again
            </Button>
          </Card>
        ) : invitations.length === 0 ? (
          <Card className="rounded-2xl border-slate-200 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Mail className="h-7 w-7 text-slate-600" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No invitations found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You don't have any organization invitations associated with
              {` ${user?.email || "your account"}`}.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const expired =
                invitation.expiresAt &&
                new Date(invitation.expiresAt).getTime() <= Date.now();

              const status = String(invitation.status || "").toUpperCase();

              const canAccept =
                status === "PENDING" && !expired;

              const organizationName =
                invitation.organization?.name || "Organization";

              return (
                <Card
                  key={invitation.id}
                  className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Building2 className="h-6 w-6 text-slate-700" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-base font-semibold text-slate-900">
                              {organizationName}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              You've been invited to join this organization.
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                              expired
                                ? "bg-red-50 text-red-600"
                                : status === "PENDING"
                                  ? "bg-amber-50 text-amber-700"
                                  : status === "ACCEPTED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {expired && status === "PENDING"
                              ? "Expired"
                              : formatRole(status)}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">Role</p>
                              <p className="mt-0.5 text-sm font-medium text-slate-800">
                                {formatRole(invitation.role)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                Invited email
                              </p>
                              <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                                {invitation.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            {/* <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" /> */}
                            <div>
                              <p className="text-xs text-slate-500">
                                Created
                              </p>
                              <p className="mt-0.5 text-sm font-medium text-slate-800">
                                {formatDate(invitation.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">
                                Expires
                              </p>
                              <p className="mt-0.5 text-sm font-medium text-slate-800">
                                {formatDate(invitation.expiresAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {canAccept && (
                          <Button
                            onClick={() => handleAccept(invitation)}
                            disabled={acceptingId !== null}
                            className="h-10 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto"
                          >
                            {acceptingId === invitation.id ? (
                              <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                Accept invitation
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}

                        {!canAccept && status === "PENDING" && expired && (
                          <p className="text-sm text-red-600">
                            This invitation has expired. Ask the organization
                            administrator to send a new one.
                          </p>
                        )}

                        {status === "ACCEPTED" && (
                          <p className="flex items-center gap-2 text-sm text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            You have already accepted this invitation.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}