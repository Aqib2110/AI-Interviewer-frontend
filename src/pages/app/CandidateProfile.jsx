
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Linkedin,
  Eye,
  Download,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel, KeyValue } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import {
  DetailSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import {
  StatusBadge,
  RecommendationBadge,
} from "@/components/common/Badges";
import {
  ScoreRing,
  ScorePill,
} from "@/components/common/ScoreRing";
import { SkillBar } from "@/components/common/SkillBar";
import {
  ResumeDocument,
  ResumeModal,
  downloadResume,
} from "@/components/media/Resume";
import { Summary } from "@/components/interviews/ReportBlocks";
import { candidatesService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { formatDate } from "@/lib/format";
import { useSession } from "@/context/SessionContext";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const {can,role} = useSession();
  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => candidatesService.getProfile(id),
    [id]
  );

  const [resumeOpen, setResumeOpen] = useState(false);

  const profile = useMemo(() => {
    // Backend returns { candidate: [interview, ...] }
    const interviews = Array.isArray(data?.candidate)
      ? data.candidate
      : [];

    if (!interviews.length) {
      return null;
    }

    // The candidate profile is nested inside each interview.
    const candidate =
      interviews.find((iv) => iv.interviewcandidate)
        ?.interviewcandidate ?? null;

    if (!candidate) {
      return null;
    }

    // Find the most recent interview with a report.
    const reportInterview = [...interviews]
      .filter((iv) => iv.Report)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0];

    const report = reportInterview?.Report ?? null;

    // Map backend interview fields to the fields used by the UI.
    const interviewHistory = [...interviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return {
      candidate: {
        id: candidate.id,
        name: candidate.name ?? candidate.fullName ?? "Unknown candidate",
        email: candidate.email ?? null,
        phone: candidate.phone ?? null,
        location: candidate.location ?? null,
        currentTitle: candidate.currRole ?? candidate.currentTitle ?? null,
        experience: candidate.experience ?? null,
        linkedin: candidate.linkedin ?? null,
      },

      interviews: interviewHistory.map((iv) => ({
        id: iv.id,
        title: iv.title,
        interviewDate: iv.startedAt ?? null,
        createdAt: iv.createdAt,
        durationMin: iv.durationMinutes ?? null,
        status: iv.status,
        overallScore: iv.Report?.score ?? iv.score ?? null,
      })),

      // No resume object is included in the sample response.
      resume: candidate.resume ?? null,

      latestReport: report
        ? {
            interviewId: reportInterview.id,
            role: reportInterview.role ?? report.role ?? "Interview",
            score: report.score ?? reportInterview.score ?? 0,
            recommendation: report.recommendation ?? "PENDING",
            summary: report.summary ?? "",
            skills: Array.isArray(report.skills)
              ? report.skills
              : [],
          }
        : null,
    };
  }, [data]);

  return (
        <>
      <Link
        to="/app/candidates"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        data-testid="back-to-candidates-link"
      >
        <ArrowLeft className="h-4 w-4" />
        Candidates
      </Link>

      {loading && <DetailSkeleton />}

      {error && (
        <ErrorState error={error} onRetry={reload} />
      )}

      {!loading && !error && !profile && (
        <EmptyState
          title="Candidate not found"
          description="No candidate profile was found for this ID."
        />
      )}

      {profile && (() => {
        const { candidate: c, interviews, resume, latestReport: r } = profile;

        return (
          <div
            className="space-y-6"
            data-testid="candidate-profile"
          >
            <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
              <Avatar name={c.name} size="xl" />

              <div className="min-w-0 flex-1">
                <h1
                  className="text-2xl font-semibold text-slate-950"
                  data-testid="candidate-profile-name"
                >
                  {c.name}
                </h1>

                <p className="mt-1 text-slate-600">
                  {c.currentTitle ?? "No current title provided"}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
                  <KeyValue label="Email" icon={Mail}>
                    {c.email ?? "—"}
                  </KeyValue>

                  <KeyValue label="Phone" icon={Phone}>
                    {c.phone ?? "—"}
                  </KeyValue>

                  <KeyValue label="Location" icon={MapPin}>
                    {c.location ?? "—"}
                  </KeyValue>

                  <KeyValue label="Experience" icon={Briefcase}>
                    {c.experience ?? "—"}
                  </KeyValue>

                  <KeyValue label="LinkedIn" icon={Linkedin}>
                    {c.linkedin ? (
                      <a
                        href={c.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View profile
                      </a>
                    ) : (
                      "—"
                    )}
                  </KeyValue>
                </dl>
              </div>

              {r && (
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing
                    score={r.score}
                    size={112}
                    stroke={9}
                  />
                  <RecommendationBadge value={r.recommendation} />
                </div>
              )}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6">
                <Panel
                  title="Interview history"
                  description={`${interviews.length} interview${interviews.length !== 1 ? "s" : ""}`}
                  bodyClassName="p-2"
                >
                  {interviews.length ? (
                    interviews.map((iv) => (
                      <Link
                        key={iv.id}
                        to={`/app/interviews/${iv.id}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-50"
                        data-testid={`profile-interview-${iv.id}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {iv.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatDate(
                              iv.interviewDate || iv.createdAt
                            )}

                            {iv.durationMin != null &&
                              iv.durationMin > 0 &&
                              ` · ${iv.durationMin} min`}
                          </p>
                        </div>

                        <StatusBadge status={iv.status} />

                        <ScorePill score={iv.overallScore} />

                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </Link>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      No interviews found.
                    </p>
                  )}
                </Panel>

                {r ? (
                  <Panel
                    title={`Latest evaluation · ${r.role}`}
                    actions={
                      <Link
                        to={`/app/interviews/${r.interviewId}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Open report
                      </Link>
                    }
                  >
                    <Summary text={r.summary} />

                    {r.skills.length > 0 && (
                      <div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
                        {r.skills.map((skill) => (
                          <SkillBar
                            key={skill.name}
                            {...skill}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </Panel>
                ) : (
                  <EmptyState
                    title="Not evaluated yet"
                    description="Scores and the AI summary will appear after the candidate completes an interview."
                  />
                )}
              </div>

              <Panel
                title="Resume"
                description={resume?.fileName}
                actions={
                  resume && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResumeOpen(true)}
                        data-testid="profile-view-resume-button"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadResume(resume)}
                        data-testid="profile-download-resume-button"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                }
                bodyClassName="bg-slate-100 p-4"
              >
                {resume ? (
                  <ResumeDocument
                    resume={resume}
                    name={c.name}
                    contact={`${c.email ?? ""}${c.location ? ` · ${c.location}` : ""}`}
                    className="px-6 py-6"
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No resume provided.
                  </p>
                )}
              </Panel>
            </div>

            <ResumeModal
              open={resumeOpen}
              onOpenChange={setResumeOpen}
              resume={resume}
              candidate={c}
            />
          </div>
        );
      })()}
    </>
  );
}