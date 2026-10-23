import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, ArrowUpDown, Users } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/Layout";
import { TableSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { candidatesService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";

function RowActions({ candidate }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        onClick={(e) => e.stopPropagation()}
        data-testid={`candidate-actions-${candidate.id}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => navigate(`/app/candidates/${candidate.id}`)}
        >
          View profile
        </DropdownMenuItem>

        {candidate.interviewId && (
          <DropdownMenuItem
            onClick={() =>
              navigate(`/app/interviews/${candidate.interviewId}`)
            }
          >
            Open interview
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => {
            if (candidate.email && navigator.clipboard) {
              navigator.clipboard.writeText(candidate.email);
            }
          }}
        >
          Copy email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CandidatesPage() {
  const { orgId, orgName } = useSession();
  const navigate = useNavigate();

  const { data, loading, error, reload } = useAsync(
    () => candidatesService.list(),
    [orgId]
  );

  const [q, setQ] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  const candidates = data?.candidates ?? [];

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = candidates.filter((candidate) =>
      [
        candidate.name,
        candidate.email,
        candidate.currRole,
        candidate.location,
        candidate.experience,
        candidate.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;

      return sortNewest ? dateB - dateA : dateA - dateB;
    });
  }, [candidates, q, sortNewest]);

  return (
    <>
      <PageHeader
        eyebrow={orgName}
        title="Candidates"
        description="Candidates who have submitted their information for your organization's interviews."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidates"
            className="bg-white pl-9"
            data-testid="candidate-search-input"
          />
        </div>

        <button
          type="button"
          onClick={() => setSortNewest((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"
          data-testid="sort-candidates-button"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortNewest ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {loading && <TableSkeleton cols={6} />}

      {!loading && error && (
        <ErrorState error={error} onRetry={reload} />
      )}

      {!loading && !error && candidates.length === 0 && (
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Candidates will appear here after they submit their interview information form."
          action={
            <Link
              className="text-sm font-medium text-blue-600"
              to="/app/interviews/new"
            >
              Create an interview
            </Link>
          }
        />
      )}

      {!loading && !error && candidates.length > 0 && (
        <>
          <div
            className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block"
            data-testid="candidates-table"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Current role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Phone
                  </TableHead>
                  <TableHead>Date submitted</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/app/candidates/${candidate.id}`)
                    }
                    data-testid={`candidate-row-${candidate.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={candidate.name} size="sm" />

                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {candidate.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-700">
                      {candidate.currRole || "—"}
                    </TableCell>

                    <TableCell>
                      {candidate.experience || "—"}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {candidate.location || "—"}
                    </TableCell>

                    <TableCell className="hidden xl:table-cell">
                      {candidate.phone || "—"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-mono text-xs text-slate-500">
                      {candidate.createdAt
                        ? formatDate(candidate.createdAt)
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <RowActions candidate={candidate} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {rows.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">
                No candidates match your search.
              </p>
            )}
          </div>

          <div
            className="space-y-2 md:hidden"
            data-testid="candidates-mobile-list"
          >
            {rows.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() =>
                    navigate(`/app/candidates/${candidate.id}`)
                  }
                >
                  <Avatar name={candidate.name} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {candidate.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {candidate.email}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {candidate.currRole || "Role not specified"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {candidate.experience || "Experience not specified"}
                    </p>
                  </div>
                </button>

                <RowActions candidate={candidate} />
              </div>
            ))}

            {rows.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">
                No candidates match your search.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}