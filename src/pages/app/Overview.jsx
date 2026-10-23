import { Link, useNavigate } from "react-router-dom";
import { MessagesSquare, CheckCircle2, Hourglass, Gauge, Users, Plus, ArrowRight, FileText, Upload } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard } from "@/components/common/Layout";
import { CardsSkeleton, ErrorState, EmptyState, ListSkeleton } from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { StatusBadge } from "@/components/common/Badges";
import { ScorePill } from "@/components/common/ScoreRing";
import { SkillBar } from "@/components/common/SkillBar";
import { dashboardService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate, formatShortDate } from "@/lib/format";

function InterviewRows({ items }) {
  const {user} = useSession();
  const navigate = useNavigate();
  return (
    <div className="-mx-5 -my-2 divide-y divide-slate-100">
      {items.map((iv) => (
        <button key={iv?.id} onClick={() => navigate(`/app/interviews/${iv?.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50" data-testid={`overview-interview-row-${iv?.id}`}>
          <Avatar name={iv?.candidate?.name || user?.name} size="sm" />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{iv?.candidate?.name}</span><span className="block truncate text-xs text-slate-500">{iv?.role}</span></span>
          <StatusBadge status={iv?.status} className="hidden sm:inline-flex" />
          <span className="hidden w-16 text-right font-mono text-xs text-slate-400 md:block">{formatShortDate(iv?.interviewDate || iv?.createdAt)}</span>
          <ScorePill score={iv?.overallScore} />
        </button>
      ))}
    </div>
  );
}

const NewBtn = () => {
  // const { can } = useSession();
  // return can("interview:create") ? <Button asChild data-testid="overview-new-interview-button"><Link to="/app/interviews/new"><Plus className="mr-1.5 h-4 w-4" /> New interview</Link></Button> : null;
};

function OrgOverview() {
  const { orgName, user,orgId } = useSession();

  const { data, loading, error, reload } = useAsync(() => dashboardService.getOrgOverview(orgId), [orgId]);
  const complInterviews = data?.interviews?.filter(int=>int.status === "COMPLETED").length;
  const pendInterviews = data?.interviews?.filter(int=>int.status === "IN_PROGRESS" || "PENDING").length;
  const candidates = data?.interviews?.filter(int=>int?.interviewcandidate?.id);
  const recentInterviews = data?.interviews?.toSorted((a, b) =>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentCandidates = candidates?.toSorted((a, b) =>new Date(b.interviewcandidate.createdAt).getTime() - new Date(a.interviewcandidate.createdAt).getTime()).slice(0, 5);

  return (
    <div data-testid="org-overview">
      <PageHeader eyebrow={orgName} title={`Good afternoon, ${user?.name?.split(" ")[0]}`} description="Here's how hiring is moving across your workspaces this week." actions={<><Button variant="outline" asChild><Link to="/app/candidates">View candidates</Link></Button><NewBtn /></>} />
      {loading && <div className="space-y-6"><CardsSkeleton count={5} /><ListSkeleton rows={5} /></div>}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data?.stats?.total === 0 && <EmptyState icon={MessagesSquare} title={`No interviews in ${orgName} yet`} description="Create a structured AI interview and send the link to your first candidate." action={<NewBtn />} />}
      {data && data?.stats?.total > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard index={0} label="Total interviews" value={data?.stats?.total} hint="+4 vs last week" icon={MessagesSquare} testId="stat-total-interviews" />
            <StatCard index={1} label="Completed" value={complInterviews} hint="Reports generated" icon={CheckCircle2} testId="stat-completed" />
            <StatCard index={2} label="Pending" value={pendInterviews} hint="Invited or in progress" icon={Hourglass} testId="stat-pending" />
            <StatCard index={3} label="Avg. candidate score" value={data?.stats?.avgScore} suffix="/100" hint="Across completed interviews" icon={Gauge} testId="stat-average-score" />
            <StatCard index={4} label="Candidates" value={candidates?.length} hint="In active pipelines" icon={Users} testId="stat-candidates" />
          </div>
          {/* <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Interview activity" description="Completed interviews per week and average score" testId="activity-chart">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data?.weeklyTrend} margin={{ left: -18, right: 4, top: 8 }}>
                    <CartesianGrid vertical={false} stroke="#EEF2F7" />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis yAxisId="l" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis yAxisId="r" orientation="right" domain={[50, 100]} hide />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} cursor={{ fill: "#F1F5F9" }} />
                    <Bar yAxisId="l" dataKey="interviews" name="Interviews" fill="#0F172A" radius={[3, 3, 0, 0]} barSize={22} />
                    <Line yAxisId="r" dataKey="avgScore" name="Avg score" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: "#2563EB" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Skill performance" description="Average score per skill across evaluated candidates" bodyClassName="space-y-4" testId="skill-performance">
              {data?.skillPerformance?.map((s) => <SkillBar key={s.name} name={s.name} score={s.score} compact />)}
            </Panel>
          </div> */}
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Recent interviews" actions={<Link to="/app/interviews" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline" data-testid="overview-all-interviews-link">View all <ArrowRight className="h-3 w-3" /></Link>}>
              <InterviewRows items={recentInterviews} />
            </Panel>
            <Panel title="Recent candidates" actions={<Link to="/app/candidates" className="text-xs font-medium text-blue-600 hover:underline">View all</Link>} bodyClassName="space-y-1 p-2">
              {recentCandidates?.map((c) => (
                <Link key={c?.interviewcandidate?.id} to={`/app/candidates/${c?.interviewcandidate?.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50" data-testid={`overview-candidate-${c?.id}`}>
                  <Avatar name={c?.interviewcandidate?.name} size="sm" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{c?.interviewcandidate?.name}</span><span className="block truncate text-xs text-slate-500">{c?.interviewcandidate?.location} · {c?.interviewcandidate?.experience}</span></span>
                  <ScorePill score={c?.score} />
                </Link>
              ))}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function IndividualOverview() {
  const { user, orgId } = useSession();

  const { data, loading, error, reload } = useAsync(
    () => dashboardService.getIndividualOverview(),
    [orgId]
  );

  const interviews = data?.interviews ?? [];

  const totalInterviews = data?.stats?.total ?? 0;

  const compInterviews = interviews.filter(
    (int) => int.status === "COMPLETED"
  ).length;

  const pendInterviews = interviews.filter(
    (int) =>
      int.status === "PENDING" || int.status === "IN_PROGRESS"
  ).length;

  const recentInterviews = [...interviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const resumeSkills = (() => {
    try {
      const skills = data?.resume?.skills;
      return Array.isArray(skills) ? skills : JSON.parse(skills || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div data-testid="individual-overview">
      <PageHeader
        eyebrow="Personal account"
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Practice structured interviews and track how your skills are evaluated over time."
        actions={<NewBtn />}
      />

      {loading && (
        <div className="space-y-6">
          <CardsSkeleton />
          <ListSkeleton rows={3} />
        </div>
      )}

      {error && <ErrorState error={error} onRetry={reload} />}

      {data && !loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              index={0}
              label="Total interviews"
              value={totalInterviews}
              icon={MessagesSquare}
              testId="stat-total-interviews"
            />

            <StatCard
              index={1}
              label="Completed"
              value={compInterviews}
              icon={CheckCircle2}
              testId="stat-completed"
            />

            <StatCard
              index={2}
              label="Pending"
              value={pendInterviews}
              icon={Hourglass}
              testId="stat-pending"
            />

            <StatCard
              index={3}
              label="Average score"
              value={data.stats?.avgScore ?? "—"}
              suffix={data.stats?.avgScore != null ? "/100" : ""}
              icon={Gauge}
              testId="stat-average-score"
            />
          </div>

          <div className="flex flex-col gap-6">
            <Panel
              title="Your interviews"
              actions={
                <Link
                  to="/app/interviews"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View all
                </Link>
              }
            >
              {recentInterviews.length > 0 ? (
                <InterviewRows items={recentInterviews} />
              ) : (
                <EmptyState
                  title="No interviews yet"
                  description="Create a practice interview for the role you're targeting."
                  action={<NewBtn />}
                  className="border-0"
                />
              )}
            </Panel>

            <div className="space-y-6">
              <Panel title="Resume" testId="resume-status-card">
                {data.resume ? (
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {data.resume.fileKey?.split("/").pop() ||
                          "Uploaded resume"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {data.resume.status === "PROCESSED"
                          ? "Resume processed and ready to use"
                          : `Resume status: ${data.resume.status || "Unknown"}`}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {resumeSkills.length} skills detected
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No resume uploaded yet.
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  asChild
                >
                  <Link
                    to="/app/resume"
                    data-testid="overview-manage-resume-button"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Manage resume
                  </Link>
                </Button>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const { context } = useSession();
  return context === "individual" ? <IndividualOverview /> : <OrgOverview />;
}
