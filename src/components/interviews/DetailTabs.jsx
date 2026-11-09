import html2pdf from "html2pdf.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Send,
  Radio,
  Clock3,
  Hourglass,
  ChevronDown,
  Play,
  Download,
  Sparkles,
  Bot,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/common/Layout";
import { SkillBar } from "@/components/common/SkillBar";
import { Chip } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/States";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { ResumeDocument, downloadResume } from "@/components/media/Resume";
import { PipelineSteps } from "./PipelineSteps";
import {
  OverallScore,
  Summary,
  StrengthsWeaknesses,
  RecommendationCard,
} from "./ReportBlocks";
import { formatClock, scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

const getInterview = (detail = {}) => detail || {};

const getCandidate = (detail = {}) => {
  const interview = getInterview(detail);

  return (
    interview?.interviewcandidate ||
    interview?.candidate ||
    detail?.candidate ||
    {}
  );
};

const getReportRecord = (detail = {}) => {
  const interview = getInterview(detail);

  return (
    interview?.Report ||
    interview?.report ||
    detail?.Report ||
    detail?.report ||
    null
  );
};

const getMessages = (detail = {}) => {
  const interview = getInterview(detail);
  console.log(JSON.parse(interview?.Report?.content)?.transcript,"transcript");
  return (
    interview?.Report?.content ? JSON.parse(interview?.Report?.content)?.transcript : []
  );
};

const getResume = (detail = {}) => {
  const candidate = getCandidate(detail);

  return (
    detail?.resume ||
    candidate?.resume ||
    candidate?.Resume ||
    null
  );
};

const getReportContent = (detail = {}) => {
  const reportRecord = getReportRecord(detail);

  if (!reportRecord) return null;

  const content = reportRecord?.content;

  if (!content) return reportRecord;

  if (typeof content === "object") {
    return content;
  }

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);

      return parsed && typeof parsed === "object"
        ? parsed
        : { summary: content };
    } catch {
      return { summary: content };
    }
  }

  return reportRecord;
};

const getSkills = (detail = {}) => {
  const interview = getInterview(detail);
  const report = getReportContent(detail);

  const reportSkills = report?.skills;

  if (Array.isArray(reportSkills) && reportSkills.length) {
    return reportSkills.map((skill) => {
      if (typeof skill === "string") {
        return { name: skill };
      }

      return skill;
    });
  }

  return (interview?.skills || []).map((skill) =>
    typeof skill === "string" ? { name: skill } : skill
  );
};

const getCandidateName = (detail = {}) => {
  const candidate = getCandidate(detail);
  const interview = getInterview(detail);

  return (
    candidate?.name ||
    candidate?.fullName ||
    interview?.candidateEmail ||
    "Candidate"
  );
};

const normalizeStatus = (status) =>
  String(status || "").toLowerCase();

const getMessageQuestion = (message = {}) =>
  message?.aiMsg ||
  message?.assistMsg ||
  message?.question ||
  message?.aiMessage ||
  "";

const getMessageAnswer = (message = {}) =>
  message?.userMsg ||
  message?.answer ||
  message?.userMessage ||
  "";

const getMessageTime = (message = {}) => {
  if (!message?.createdAt) return "";

  const date = new Date(message.createdAt);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function NotReady({ interview = {}, what = "report" }) {
  const status = normalizeStatus(interview?.status);
  const candidateName =
    interview?.interviewcandidate?.name ||
    interview?.candidate?.name ||
    interview?.candidateEmail ||
    "The candidate";

  const copy = async () => {
    if (!interview?.id) {
      toast.error("Interview link is unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/interview/${interview.id}`
      );
      toast.success("Interview link copied");
    } catch {
      toast.error("Could not copy interview link");
    }
  };

  const states = {
    in_progress: {
      icon: Radio,
      title: "Interview in progress",
      description: `${candidateName} is currently taking the interview. The ${what} will appear after the session is processed.`,
    },
    pending: {
      icon: Hourglass,
      title: "Waiting for the candidate",
      description: `The interview has not been completed yet. The ${what} will be available once the session finishes.`,
    },
    expired: {
      icon: Clock3,
      title: "Interview link expired",
      description: "The candidate did not start the interview before the link expired.",
    },
  };

  const state = states[status] || {
    icon: Clock3,
    title: "Information unavailable",
    description: `The ${what} is not available yet.`,
  };

  const canOpenInterview =
    Boolean(interview?.id) && status !== "expired";

  return (
    <EmptyState
      icon={state.icon}
      title={state.title}
      description={state.description}
      testId={`not-ready-${status || "unknown"}`}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {canOpenInterview && (
            <Button asChild size="sm">
              <Link to={`/interview/${interview.id}`}>
                <Video className="mr-1.5 h-3.5 w-3.5" />
                {status === "in_progress"
                  ? "Open interview"
                  : "View interview"}
              </Link>
            </Button>
          )}

          {interview?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={copy}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy link
            </Button>
          )}
        </div>
      }
    />
  );
}

export function OverviewTab({
  detail = {},
  onOpenVideo = () => {},
  onOpenResume = () => {},
  goTab = () => {},
  context,
  isOrganization,
}) {
  const interview = getInterview(detail);
  const report = getReportContent(detail);
  const candidateName = getCandidateName(detail);
  const recording = detail?.recording || null;
  const resume = getResume(detail);
  const skills = getSkills(detail);
  console.log(skills,"skills");

  const organizationView =
    isOrganization ?? context === "organization";

  return (
    <div className="space-y-5">
      <Panel
        title="Hiring pipeline"
        description="Track this interview through the workflow"
      >
        <PipelineSteps status={interview?.status} />
      </Panel>

      {!report ? (
        organizationView && (
          <NotReady interview={interview} what="report" />
        )
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <div className="space-y-5">
            <Panel
              title="Evaluation"
              description="Candidate evaluation based on the interview"
            >
              <OverallScore
                score={report?.overallScore ?? interview?.score}
                recommendation={report?.recommendation}
                dimensions={report?.dimensions || []}
              />
            </Panel>

            <Panel
              title="Summary"
              actions={
                <button
                  onClick={() => goTab("report")}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Full report
                </button>
              }
            >
              <Summary
                text={
                  report?.summary ||
                  report?.overallSummary ||
                  report?.content ||
                  ""
                }
              />

              <div className="mt-5">
                <StrengthsWeaknesses
                  strengths={report?.strengths?.slice?.(0, 3) || []}
                  weaknesses={report?.areasToImprove?.slice?.(0, 3) || []}
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel
              title="Skills"
              actions={
                <button
                  onClick={() => goTab("skills")}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  All skills
                </button>
              }
              bodyClassName="space-y-4"
            >
              {skills.length ? (
                skills
                  .slice()
                  .sort(
                    (a, b) =>
                      (Number(b?.score) || 0) -
                      (Number(a?.score) || 0)
                  )
                  .slice(0, 4)
                  .map((skill, index) =>
                    skill?.score != null ? (
                      <SkillBar
                        key={skill?.skill || index}
                        {...skill}
                        compact
                      />
                    ) : (
                      <Chip key={skill?.skill || index}>
                        {skill?.skill || "Skill"}
                      </Chip>
                      
                    )
                  )
              ) : (
                <p className="text-sm text-slate-500">
                  No skills available.
                </p>
              )}
            </Panel>

            {recording?.url && (
              <Panel title="Recording" bodyClassName="p-3">
                <VideoPlayer
                  recording={recording}
                  candidateName={candidateName}
                  onExpand={onOpenVideo}
                />
              </Panel>
            )}

            {resume && (
              <Panel
                title="Resume"
                description={
                  resume?.fileName ||
                  resume?.originalName ||
                  "Candidate resume"
                }
                actions={
                  <button
                    onClick={onOpenResume}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View
                  </button>
                }
                bodyClassName="p-0"
              >
                <button
                  onClick={onOpenResume}
                  className="relative block h-48 w-full overflow-hidden bg-slate-100 px-6 pt-5 text-left"
                >
                  <ResumeDocument
                    resume={resume}
                    name={candidateName}
                    className="origin-top scale-[0.62] px-6 py-6"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100" />
                </button>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillsTab({ detail = {}, context, isOrganization }) {
  const interview = getInterview(detail);
  const report = getReportContent(detail);
  const skills = getSkills(detail);
  const organizationView =
    isOrganization ?? context === "organization";

  const scoredSkills = skills.filter(
    (skill) => skill?.score != null
  );

  const sortedSkills = [...scoredSkills].sort(
    (a, b) =>
      (Number(b?.score) || 0) -
      (Number(a?.score) || 0)
  );

  const average = scoredSkills.length
    ? Math.round(
        scoredSkills.reduce(
          (total, skill) =>
            total + (Number(skill?.score) || 0),
          0
        ) / scoredSkills.length
      )
    : null;

  return (
    <div className="space-y-5">
      {!report && organizationView && (
        <NotReady
          interview={interview}
          what="skill evaluation"
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <Panel
          title="Skills"
          description="Skills associated with this interview"
          bodyClassName="space-y-3"
        >
          {skills.length ? (
            skills.map((skill, index) =>
              skill?.score != null ? (
                <SkillBar
                  key={skill?.name || index}
                  {...skill}
                  defaultOpen={index < 2}
                />
              ) : (
                <div
                  key={skill?.name || index}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {skill?.name || "Skill"}
                  </p>
                  {skill?.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {skill.description}
                    </p>
                  )}
                </div>
              )
            )
          ) : (
            <p className="text-sm text-slate-500">
              No skills are available for this interview.
            </p>
          )}
        </Panel>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Overall interview score
            </p>
            <p className="mt-1.5 text-xl font-semibold text-slate-950">
              {interview?.score ?? report?.overallScore ?? "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Average skill score
            </p>
            <p className="mt-1.5 text-xl font-semibold text-slate-950">
              {average ?? "—"}
            </p>
          </div>

          {/* <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Strongest evaluated skill
            </p>
            <p className="mt-1.5 font-semibold text-slate-950">
              {sortedSkills[0]?.name || "—"}
            </p>
          </div> */}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs text-slate-500">
              Skills distribution
            </p>

            {scoredSkills.length ? (
              <div className="flex h-24 items-end gap-1.5">
                {scoredSkills.map((skill, index) => (
                  <motion.div
                    key={skill?.skill || index}
                    title={`${skill?.skill || "Skill"}: ${skill?.score}`}
                    className={cn(
                      "flex-1 rounded-t",
                      scoreTone(Number(skill?.score) || 0)?.bar
                    )}
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.min(
                        100,
                        Math.max(0, Number(skill?.score) || 0)
                      )}%`,
                    }}
                    transition={{ duration: 0.7 }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Skill scores are not available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QA({ item = {}, index = 0, onJump = () => {} }) {
  const [open, setOpen] = useState(index === 0);

  const question = getMessageQuestion(item);
  const answer = getMessageAnswer(item);
  const time = getMessageTime(item);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white"
      data-testid={`transcript-item-${item?.id || index}`}
    >
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
      >
        <span className="font-mono text-xs text-slate-400">
          {index + 1}
        </span>

        <span className="flex-1 truncate text-sm font-medium text-slate-900">
          {question || "Interview message"}
        </span>

        <span className="hidden text-xs text-slate-400 sm:inline">
          {time}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-slate-100 px-5 py-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    AI Interviewer
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                    {question || "No AI message available."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <User className="h-3.5 w-3.5" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    Candidate
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {answer || "No candidate response available."}
                  </p>
                </div>
              </div>

              {time && (
                <button
                  onClick={() => onJump(item?.createdAt)}
                  className="ml-10 text-xs text-blue-600 hover:underline"
                >
                  Message time: {time}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TranscriptTab({
  detail = {},
  onOpenVideo = () => {},
  context,
  isOrganization,
}) {
  const interview = getInterview(detail);
    console.log(interview,"interview");

  const messages = getMessages(detail);
  console.log(messages,"messages");
  const organizationView =
    isOrganization ?? context === "organization";

  if (!messages.length && organizationView) {
    return (
      <NotReady
        interview={interview}
        what="transcript"
      />
    );
  }

  if (!messages.length) {
    return (
      <EmptyState
        icon={Bot}
        title="No transcript available"
        description="Messages will appear here when they are available."
      />
    );
  }

  const jumpToMessage = (createdAt) => {
    if (!createdAt) return;

    const recording = detail?.recording;

    if (typeof recording?.getTimestamp === "function") {
      onOpenVideo(recording.getTimestamp(createdAt));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {messages.length} messages · ordered by creation time
      </p>

      {[...messages]
        .sort(
          (a, b) =>
            new Date(a?.createdAt || 0).getTime() -
            new Date(b?.createdAt || 0).getTime()
        )
        .map((message, index) => (
          <QA
            key={message?.id || index}
            item={message}
            index={index}
            onJump={jumpToMessage}
          />
        ))}
    </div>
  );
}

export function ReportTab({
  detail = {},
  context,
  isOrganization,
}) {
  const interview = getInterview(detail);
  const reportRecord = getReportRecord(detail);
  const report = getReportContent(detail);
  const organizationView =
    isOrganization ?? context === "organization";

  if (!reportRecord && organizationView) {
    return (
      <NotReady
        interview={interview}
        what="report"
      />
    );
  }

  if (!reportRecord) {
    return (
      <EmptyState
        icon={Download}
        title="No report available"
        description="The interview report has not been generated yet."
      />
    );
  }

  const candidateName = getCandidateName(detail);

 const exportReport = async () => {
  const element = document.querySelector(
    '[data-testid="full-report"]'
  );

  if (!element) return;

  const button = element.querySelector("button");

  try {
    const options = {
      margin: [10, 10, 10, 10],
      filename: `interview-report-${interview?.id || "report"}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",
  logging: false,
  ignoreElements: (element) =>
    element.classList.contains("pdf-hide"),
},
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
        avoid: [".rounded-lg", ".rounded-xl"],
      },
    };

    await html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(120);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 30,
            pdf.internal.pageSize.getHeight() - 5
          );
        }
      })
      .save();
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white"
      data-testid="full-report"
    >
             
             
     <header className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

  <div>
    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
      Candidate report
    </p>

    <h2 className="mt-1 text-xl font-semibold text-slate-950">
      {candidateName} · {interview?.role || "Role not specified"}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {reportRecord?.createdAt
        ? `Created ${new Date(reportRecord.createdAt).toLocaleDateString()}`
        : "Interview evaluation"}
    </p>
  </div>

  <Button
    className="pdf-hide flex gap-2"
    variant="outline"
    size="sm"
    onClick={exportReport}
  >
    <Download className="mr-1.5 h-3.5 inline w-3.5" />
    Export report
  </Button>

</header>

      <div className="space-y-8 p-6">
        <OverallScore
          score={report?.overallScore ?? interview?.score}
          recommendation={report?.recommendation}
          dimensions={report?.dimensions || []}
        />

        <Summary
          text={
            report?.summary ||
            report?.overallSummary ||
            report?.content ||
            ""
          }
          generatedAt={reportRecord?.createdAt}
        />

        <StrengthsWeaknesses
          strengths={report?.strengths || []}
          weaknesses={report?.areasToImprove || []}
        />

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">
            Skill evaluation
          </p>

          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {getSkills(detail).map((skill, index) =>
              skill?.score != null ? (
                <SkillBar
                  key={skill?.name || index}
                  {...skill}
                  compact
                />
              ) : (
                <div
                  key={skill?.name || index}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {skill?.name || "Skill"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {report?.recommendation && (
          <RecommendationCard
            recommendation={report.recommendation}
            note={report?.recommendation}
          />
        )}

        {!report?.summary &&
          !report?.overallSummary &&
          !report?.strengths?.length &&
          !report?.weaknesses?.length && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Report content
              </p>
              <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">
                {typeof reportRecord?.content === "string"
                  ? reportRecord.content
                  : JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
      </div>
    </article>
  );
}

export function RecordingTab({
  detail = {},
  onOpenVideo = () => {},
  context,
  isOrganization,
}) {
  const interview = getInterview(detail);
  console.log("intervide,",interview)
  const organizationView =
    isOrganization ?? context === "organization";

  const videoKey = interview?.videoKey || detail?.videoKey || null;

  // The interview object contains videoKey as a string.
  // Use the interview object for recording metadata.
  const recording = videoKey
    ? {
        ...interview,
        videoKey,
        status: interview?.status || "Available",
      }
    : null;

  if (!recording) {
    return (
      <div className="space-y-4">
        {organizationView && (
          <NotReady interview={interview} what="recording" />
        )}

        {!organizationView && (
          <EmptyState
            icon={Video}
            title="No recording available"
            description="A playable recording URL has not been provided."
          />
        )}
      </div>
    );
  }

  const markers = recording?.markers || [];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="space-y-3">
       <VideoPlayer
  recording={{
    videoUrl: interview.videoUrl,
    videoKey: interview.videoKey,
    status: interview.status,
    durationSec: interview.durationSec,
    markers: interview.markers ?? [],
  }}
  candidateName={getCandidateName(detail)}
   durationMinutes={interview.durationMinutes}
  onExpand={onOpenVideo}
/>

        <Button onClick={() => onOpenVideo(0)}>
          <Play className="mr-2 h-4 w-4" />
          Watch interview
        </Button>
      </div>

      <div className="space-y-4">
        <Panel
          title="Recording details"
          bodyClassName="space-y-2.5 text-sm"
        >
          {[
            ["Status", recording?.status || "Available"],
            [
              "Duration",
              recording?.durationSec != null
                ? formatClock(recording.durationSec)
                : "—",
            ],
            [
              "File size",
              recording?.sizeMb != null
                ? `${recording.sizeMb} MB`
                : "—",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-3"
            >
              <span className="text-slate-500">{label}</span>
              <span className="break-words text-right font-medium text-slate-900">
                {value}
              </span>
            </div>
          ))}
        </Panel>

        <Panel title="Chapters" bodyClassName="p-2">
          {markers.length ? (
            markers.map((marker, index) => (
              <button
                key={marker?.at ?? index}
                onClick={() => onOpenVideo(marker?.at || 0)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-mono text-xs text-blue-600">
                  {formatClock(marker?.at || 0)}
                </span>
                <span className="text-slate-700">
                  {marker?.label || "Chapter"}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">
              No chapters available.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function InterviewTabContent({
  tab = "overview",
  detail = {},
  context,
  goTab,
  onOpenVideo,
  onOpenResume,
  isOrganization,
}) {
  const props = {
    detail,
    context,
    goTab,
    onOpenVideo,
    onOpenResume,
    isOrganization,
  };

  switch (tab) {
    case "skills":
      return <SkillsTab {...props} />;

    case "transcript":
      return <TranscriptTab {...props} />;

    case "report":
      return <ReportTab {...props} />;

    case "recording":
      return <RecordingTab {...props} />;

    default:
      return <OverviewTab {...props} />;
  }
}

export { downloadResume };
