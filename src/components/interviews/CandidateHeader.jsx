import {
  ArrowLeft,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  Share2,
  ChevronDown,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar } from "@/components/common/Avatar";
import {
  StatusBadge,
  RecommendationBadge,
} from "@/components/common/Badges";
import { ScoreRing } from "@/components/common/ScoreRing";
import { KeyValue } from "@/components/common/Layout";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";

function DecisionMenu({ name }) {
  const { can } = useSession();
  const allowed = can("decision:record");

  const decide = (label) =>
    toast.success(`${name}: ${label}`, {
      description: "Decision saved to this demo session.",
    });

  if (!allowed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              size="sm"
              disabled
              data-testid="record-decision-button"
            >
              Record decision
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Viewers can't record hiring decisions
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" data-testid="record-decision-button">
          Record decision
          <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => decide("advanced to next round")}
          data-testid="decision-advance"
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
          Advance to next round
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => decide("placed on hold")}
          data-testid="decision-hold"
        >
          <PauseCircle className="mr-2 h-4 w-4 text-amber-600" />
          Put on hold
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => decide("rejected")}
          data-testid="decision-reject"
        >
          <XCircle className="mr-2 h-4 w-4 text-rose-600" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CandidateHeader({
  interview,
  onBack,
  onOpenResume,
  hasResume,
  publicView = false,
}) {
  const { context, user } = useSession();
  const navigate = useNavigate();
  const isOrganization = context === "organization";

  const share = async () => {
    try {
      const id = window.location.href.split("/").pop();
      const shareUrl = `${window.location.origin}/public/report/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Report link copied");
    } catch {
      toast.error("Unable to copy report link");
    }
  };

  const candidateName = isOrganization
    ? interview?.interviewcandidate?.name ||
      user?.name ||
      "Candidate"
    : user?.name || "My Interview";

  const candidateEmail = isOrganization
    ? interview?.interviewcandidate?.email ||
      user?.email ||
      interview?.candidateEmail
    : user?.email || interview?.candidateEmail;

  const interviewStatus = interview?.status?.toUpperCase();
console.log(interviewStatus,"interviewStatusss");
  const canStartInterview =
    !isOrganization &&
    interviewStatus === "PENDING" &&
    Boolean(interview?.slug);

  const startInterview = () => {
    if (interview?.slug) {
      navigate(`/interview/${interview.slug}`);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      data-testid="candidate-header"
    >
      <div className="p-5 sm:p-7">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:hidden"
            data-testid="detail-back-button"
          >
            <ArrowLeft className="h-4 w-4" />
            All interviews
          </button>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar name={candidateName} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="break-words text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl"
                  data-testid="candidate-name"
                >
                  {candidateName}
                </h1>

                <StatusBadge
                  status={interviewStatus}
                  data-testid="candidate-status"
                />
              </div>

              <p className="mt-1 break-all text-sm text-slate-500">
                {candidateEmail || "No email available"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                {interview?.role && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {interview.role}
                  </span>
                )}

                {interview?.createdAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDate(interview.createdAt)}
                  </span>
                )}

                {interview?.durationMinutes > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {interview.durationMinutes} min
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600">
                  Interview status:
                </span>
                <StatusBadge status={interviewStatus} />
              </div>

              {isOrganization && (
                <p className="mt-3 text-xs text-slate-400">
                  Interview ID: {interview?.id?.toUpperCase() || "—"}
                  {interview?.createdBy &&
                    ` · Created by ${interview.createdBy}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:justify-start lg:w-auto lg:min-w-[220px] lg:flex-col lg:justify-center lg:p-5 lg:text-center">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Overall score
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {interview?.Report?.content?.overallScore != null
                  ? "Interview evaluation"
                  : "Awaiting evaluation"}
              </p>
            </div>

            <ScoreRing
              score={interview?.score}
              size={96}
              stroke={8}
              testId="header-score-ring"
            />

            {interview?.Report?.content?.recommendation && (
              <RecommendationBadge
                value={interview.Report.content.recommendation}
                data-testid="header-recommendation"
              />
            )}
          </div>
        </div>

        {isOrganization && (
          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-3 xl:grid-cols-4">
            <KeyValue label="Phone" icon={Phone}>
              {interview?.interviewcandidate?.phone ||
                interview?.phone ||
                "—"}
            </KeyValue>

            <KeyValue label="Location" icon={MapPin}>
              {interview?.interviewcandidate?.location ||
                interview?.location ||
                "—"}
            </KeyValue>

            <KeyValue label="Experience" icon={Briefcase}>
              {interview?.interviewcandidate?.experience ||
                interview?.experience ||
                "—"}
            </KeyValue>

            <KeyValue label="Current role" icon={Briefcase}>
              {interview?.interviewcandidate?.currRole ||
                interview?.currentTitle ||
                "—"}
            </KeyValue>

            <KeyValue label="Resume" icon={FileText}>
              {hasResume ? (
                <button
                  onClick={onOpenResume}
                  className="font-medium text-blue-600 hover:underline"
                  data-testid="header-view-resume-button"
                >
                  View resume
                </button>
              ) : (
                "Not provided"
              )}
            </KeyValue>
          </dl>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-7">
       { !publicView && (
          <Button
            variant="outline"
            size="sm"
            onClick={share}
            data-testid="share-report-button"
          >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          Share report
        </Button>)}

        {canStartInterview && !publicView && (
          <Button
            size="sm"
            onClick={startInterview}
            data-testid="start-interview-button"
          >
            Start interview
          </Button>
        )}

        {isOrganization && hasResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenResume}
            data-testid="open-resume-modal-button"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            View resume
          </Button>
        )}

        {isOrganization && interviewStatus === "COMPLETED" && (
          <DecisionMenu
            name={
              interview?.interviewcandidate?.name ||
              interview?.candidateName ||
              "Candidate"
            }
          />
        )}
      </div>
    </section>
  );
}