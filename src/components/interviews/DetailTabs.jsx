// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Copy, Send, Radio, Clock3, Hourglass, ChevronDown, Play, Download, Sparkles, Bot, User, Video } from "lucide-react";
// import { toast } from "sonner";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Panel } from "@/components/common/Layout";
// import { SkillBar } from "@/components/common/SkillBar";
// import { Chip } from "@/components/common/Badges";
// import { EmptyState } from "@/components/common/States";
// import { VideoPlayer } from "@/components/media/VideoPlayer";
// import { ResumeDocument, downloadResume } from "@/components/media/Resume";
// import { PipelineSteps } from "./PipelineSteps";
// import { OverallScore, Summary, StrengthsWeaknesses, RecommendationCard } from "./ReportBlocks";
// import { formatClock, scoreTone } from "@/lib/format";
// import { cn } from "@/lib/utils";
// import { useSession } from "@/context/SessionContext";

// export function NotReady({ interview = {}, what = "report" }) {
//   const copy = () => {
//     if (!interview?.id) return toast.error("Interview link is unavailable");
//     navigator.clipboard?.writeText(`https://intervia.app/i/${interview.id}`);
//     toast.success("Interview link copied");
//   };

//   const candidateName = interview?.candidate?.name || "The candidate";
//   const candidateEmail = interview?.candidate?.email || "the candidate";

//   const map = {
//     in_progress: {
//       icon: Radio,
//       title: "Interview in progress",
//       description: `${candidateName} is talking with the AI interviewer right now. The ${what} will appear here a few minutes after the session ends.`,
//     },
//     pending: {
//       icon: Hourglass,
//       title: "Waiting for the candidate",
//       description: `The interview link was sent to ${candidateEmail}. The ${what} will be generated once they complete it.`,
//     },
//     expired: {
//       icon: Clock3,
//       title: "Interview link expired",
//       description: `${candidateName} didn't start the interview before the link expired.`,
//     },
//   };

//   const s = map[interview?.status] || {
//     icon: Clock3,
//     title: "Information unavailable",
//     description: `The ${what} is not available yet.`,
//   };

//   const roomLabel =
//     interview?.status === "in_progress"
//       ? "Open live interview"
//       : interview?.context === "individual"
//         ? "Start interview"
//         : "Preview candidate view";

//   const room = interview?.id && interview?.status !== "expired" && (
//     <Button
//       asChild
//       size="sm"
//       variant={interview?.status === "in_progress" ? "default" : "outline"}
//       data-testid="open-interview-room-button"
//     >
//       <Link to={`/interview/${interview.id}`}>
//         <Video className="mr-1.5 h-3.5 w-3.5" />
//         {roomLabel}
//       </Link>
//     </Button>
//   );

//   return (
//     <EmptyState
//       icon={s.icon}
//       title={s.title}
//       description={s.description}
//       testId={`not-ready-${interview?.status || "unknown"}`}
//       action={
//         interview?.status === "in_progress" ? room : (
//           <div className="flex flex-wrap justify-center gap-2">
//             {room}
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={copy}
//               disabled={!interview?.id}
//               data-testid="copy-interview-link-button"
//             >
//               <Copy className="mr-1.5 h-3.5 w-3.5" />
//               Copy link
//             </Button>
//             <Button
//               size="sm"
//               onClick={() => toast.success(`Invitation re-sent to ${candidateEmail}`)}
//               data-testid="resend-invite-button"
//             >
//               <Send className="mr-1.5 h-3.5 w-3.5" />
//               Resend invite
//             </Button>
//           </div>
//         )
//       }
//     />
//   );
// }

// export function OverviewTab({
//   detail = {},
//   onOpenVideo = () => {},
//   onOpenResume = () => {},
//   goTab = () => {},
//   context
// }) {
//   const { interview = {}, report, recording, resume } = detail || {};

//   return (
//     <div className="space-y-5">
//       <Panel title="Hiring pipeline" description="Where this interview is in the Intervia workflow">
//         <PipelineSteps status={interview?.status} />
//       </Panel>

//       {!report  ? (
//       context === "organization" && <NotReady interview={interview} />
//       ) : (
//         <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
//           <div className="space-y-5">
//             <Panel title="Evaluation" description="Scored against the interview's required skills">
//               <OverallScore
//                 score={interview?.overallScore}
//                 recommendation={report?.recommendation}
//                 dimensions={report?.dimensions || []}
//               />
//             </Panel>

//             <Panel
//               title="Summary"
//               actions={
//                 <button
//                   onClick={() => goTab("report")}
//                   className="text-xs font-medium text-blue-600 hover:underline"
//                   data-testid="overview-full-report-link"
//                 >
//                   Full report
//                 </button>
//               }
//             >
//               <Summary text={report?.summary || ""} />
//               <div className="mt-5">
//                 <StrengthsWeaknesses
//                   strengths={report?.strengths?.slice(0, 3) || []}
//                   weaknesses={report?.weaknesses?.slice(0, 3) || []}
//                 />
//               </div>
//             </Panel>
//           </div>

//           <div className="space-y-5">
//             <Panel
//               title="Top skills"
//               actions={
//                 <button
//                   onClick={() => goTab("skills")}
//                   className="text-xs font-medium text-blue-600 hover:underline"
//                   data-testid="overview-all-skills-link"
//                 >
//                   All skills
//                 </button>
//               }
//               bodyClassName="space-y-4"
//             >
//               {[...(report?.skills || [])]
//                 .sort((a, b) => (b?.score || 0) - (a?.score || 0))
//                 .slice(0, 4)
//                 .map((s, i) => (
//                   <SkillBar key={s?.name || i} {...s} compact />
//                 ))}
//             </Panel>

//             {recording && (
//               <Panel title="Recording" bodyClassName="p-3">
//                 <VideoPlayer
//                   recording={recording}
//                   candidateName={interview?.candidate?.name || "Candidate"}
//                   onExpand={onOpenVideo}
//                 />
//               </Panel>
//             )}

//             {resume && (
//               <Panel
//                 title="Resume"
//                 description={resume?.fileName || "Resume"}
//                 actions={
//                   <button
//                     onClick={onOpenResume}
//                     className="text-xs font-medium text-blue-600 hover:underline"
//                     data-testid="overview-view-resume-link"
//                   >
//                     View
//                   </button>
//                 }
//                 bodyClassName="p-0"
//               >
//                 <button
//                   onClick={onOpenResume}
//                   className="relative block h-48 w-full overflow-hidden bg-slate-100 px-6 pt-5 text-left"
//                   data-testid="overview-resume-preview"
//                 >
//                   <ResumeDocument
//                     resume={resume}
//                     name={interview?.candidate?.name || "Candidate"}
//                     className="origin-top scale-[0.62] px-6 py-6"
//                   />
//                   <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100" />
//                 </button>
//               </Panel>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export function SkillsTab({ detail = {},context }) {
//   const { interview = {}, report } = detail || {};
//   const requiredSkills = interview?.requiredSkills || [];
//   if (!report) {
//     return (
//       <div className="space-y-5">
//         <Panel title="Required skills">
//           <div className="flex flex-wrap gap-2">
//             {requiredSkills.length ? (
//               requiredSkills.map((s, i) => <Chip key={s || i}>{s}</Chip>)
//             ) : (
//               <p className="text-sm text-slate-500">No required skills available.</p>
//             )}
//           </div>
//         </Panel>
//       { context === "organization" && <NotReady interview={interview} what="skill evaluation" />}
//       </div>
//     );
//   }

//   const skills = report?.skills || [];
//   const sorted = [...skills].sort((a, b) => (b?.score || 0) - (a?.score || 0));
//   const avg = skills.length
//     ? Math.round(skills.reduce((a, s) => a + (s?.score || 0), 0) / skills.length)
//     : 0;

//   return (
//     <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
//       <Panel
//         title="Skill evaluation"
//         description="Each required skill is scored from evidence in the interview. Expand a skill to read the AI's reasoning."
//         bodyClassName="space-y-2.5"
//       >
//         {skills.length ? (
//           skills.map((s, i) => (
//             <SkillBar key={s?.name || i} {...s} defaultOpen={i < 2} />
//           ))
//         ) : (
//           <p className="text-sm text-slate-500">No skill evaluations available.</p>
//         )}
//       </Panel>

//       <div className="space-y-4">
//         {[
//           ["Average skill score", avg],
//           ["Strongest skill", sorted[0]?.name || "—", sorted[0]?.score],
//           ["Biggest gap", sorted[sorted.length - 1]?.name || "—", sorted[sorted.length - 1]?.score],
//         ].map(([label, value, score]) => (
//           <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
//             <p className="text-xs text-slate-500">{label}</p>
//             <p className="mt-1.5 font-display text-xl font-semibold text-slate-950">
//               {value}
//               {score != null && (
//                 <span className={cn("ml-2 font-mono text-sm", scoreTone(score)?.text)}>
//                   {score}
//                 </span>
//               )}
//             </p>
//           </div>
//         ))}

//         <div className="rounded-xl border border-slate-200 bg-white p-4">
//           <p className="mb-3 text-xs text-slate-500">Skills distribution</p>
//           <div className="flex h-24 items-end gap-1.5">
//             {skills.map((s, i) => (
//               <motion.div
//                 key={s?.name || i}
//                 title={`${s?.name || "Skill"}: ${s?.score ?? 0}`}
//                 className={cn("flex-1 rounded-t", scoreTone(s?.score || 0)?.bar)}
//                 initial={{ height: 0 }}
//                 animate={{ height: `${s?.score || 0}%` }}
//                 transition={{ duration: 0.7 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const RATING = {
//   strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
//   adequate: "border-blue-200 bg-blue-50 text-blue-700",
//   weak: "border-amber-200 bg-amber-50 text-amber-700",
// };

// function QA({ item = {}, onJump = () => {}, index = 0 ,context}) {
//   const [open, setOpen] = useState(true);

//   return (
//     <div className="rounded-xl border border-slate-200 bg-white" data-testid={`transcript-item-${item?.id || index}`}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
//         data-testid={`transcript-toggle-${item?.id || index}`}
//       >
//         <span className="font-mono text-xs text-slate-400">Q{index + 1}</span>
//         <span className="flex-1 truncate text-sm font-medium text-slate-900">
//           {item?.question || "Question unavailable"}
//         </span>
//         <span className={cn("hidden rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize sm:inline", RATING[item?.rating] || "border-slate-200 bg-slate-50 text-slate-600")}>
//           {item?.rating || "unrated"}
//         </span>
//         <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
//       </button>

//       <AnimatePresence initial={false}>
//         {open && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="overflow-hidden"
//           >
//             <div className="space-y-4 border-t border-slate-100 px-5 py-4">
//               <div className="flex gap-3">
//                 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
//                   <Bot className="h-3.5 w-3.5" />
//                 </span>
//                 <div>
//                   <p className="text-xs font-semibold text-slate-500">
//                     AI Interviewer
//                     {item?.at && (
//                       <button
//                         onClick={() => onJump(item.at)}
//                         className="ml-1.5 font-mono font-normal text-blue-600 hover:underline"
//                         data-testid={`transcript-jump-${item?.id || index}`}
//                       >
//                         {item.at}
//                       </button>
//                     )}
//                   </p>
//                   <p className="mt-1 text-sm text-slate-900">
//                     {item?.question || "Question unavailable"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
//                   <User className="h-3.5 w-3.5" />
//                 </span>
//                 <div>
//                   <p className="text-xs font-semibold text-slate-500">Candidate</p>
//                   <p className="mt-1 text-sm leading-relaxed text-slate-700">
//                     {item?.answer || "No answer available."}
//                   </p>
//                 </div>
//               </div>

//               <div className="ml-10 rounded-lg border border-blue-100 bg-blue-50/50 px-3.5 py-3">
//                 <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
//                   <Sparkles className="h-3 w-3" />
//                   Evaluation{item?.skill ? ` · ${item.skill}` : ""}
//                 </p>
//                 <p className="mt-1 text-[13px] text-slate-700">
//                   {item?.evaluation || "No evaluation available."}
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export function TranscriptTab({ detail = {}, onOpenVideo = () => {},context }) {
//   const { interview = {}, Message = [] } = detail || {};
//   const [rating, setRating] = useState("all");

//   if (!Message.length && context === "organization") {
//     return <NotReady interview={interview} what="transcript" />;
//   }

//   const items = Message.filter(
//     (t) => rating === "all" || t?.rating === rating
//   );

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <p className="text-sm text-slate-500">
//           {Message.length} questions · click a timestamp to jump to the recording
//         </p>
//         <div className="flex gap-1 rounded-md bg-slate-100 p-0.5">
//           {["all", "strong", "adequate", "weak"].map((r) => (
//             <button
//               key={r}
//               onClick={() => setRating(r)}
//               className={cn("rounded px-2.5 py-1 text-xs font-medium capitalize", rating === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
//               data-testid={`transcript-filter-${r}`}
//             >
//               {r}
//             </button>
//           ))}
//         </div>
//       </div>

//       {items.map((t, i) => (
//         <QA
//           key={t?.id || i}
//           item={t}
//           index={Message.indexOf(t)}
//           onJump={(at) => {
//             if (!at) return;
//             const [m, s] = at.split(":").map(Number);
//             onOpenVideo((m || 0) * 60 + (s || 0));
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// export function ReportTab({ detail = {}, context }) {
//   const { interview = {}, Report } = detail || {};
//   if (!Report && context === "organization") return <NotReady interview={interview} />;

//   return (
//     <article className="rounded-xl border border-slate-200 bg-white" data-testid="full-report">
//       <header className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
//             Candidate report
//           </p>
//           <h2 className="mt-1 text-xl font-semibold text-slate-950">
//             {interview?.candidate?.name || "Candidate"} · {interview?.role || "Role not specified"}
//           </h2>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => toast.success("Report exported as PDF", { description: "Demo only — export isn't connected yet." })}
//           data-testid="export-report-button"
//         >
//           <Download className="mr-1.5 h-3.5 w-3.5" />
//           Export PDF
//         </Button>
//       </header>

//       <div className="space-y-8 p-6">
//         <OverallScore
//           score={interview?.overallScore}
//           recommendation={Report?.recommendation}
//           dimensions={Report?.dimensions || []}
//         />
//         <Summary text={Report?.summary || ""} generatedAt={Report?.generatedAt} />
//         <StrengthsWeaknesses
//           strengths={Report?.strengths || []}
//           weaknesses={Report?.weaknesses || []}
//         />
//         <div>
//           <p className="mb-3 text-sm font-semibold text-slate-900">Skill scores</p>
//           <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
//             {(Report?.skills || []).map((s, i) => (
//               <SkillBar key={s?.name || i} {...s} compact />
//             ))}
//           </div>
//         </div>
//         <RecommendationCard
//           recommendation={Report?.recommendation}
//           note={Report?.recommendationNote}
//         />
//       </div>
//     </article>
//   );
// }

// export function RecordingTab({ detail = {}, onOpenVideo = () => {},context }) {
//   const { interview = {}, recording } = detail || {};

//   if (!recording && context === "organization") {
//     return <NotReady interview={interview} what="recording" />;
//   }

//   const markers = recording?.markers || [];

//   return (
//     <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
//       <div className="space-y-3">
//         <VideoPlayer
//           recording={recording}
//           candidateName={interview?.candidate?.name || "Candidate"}
//           onExpand={onOpenVideo}
//         />
//         {recording?.status === "ready" && (
//           <Button onClick={() => onOpenVideo(0)} data-testid="open-video-modal-button">
//             <Play className="mr-2 h-4 w-4" />
//             Watch interview
//           </Button>
//         )}
//       </div>

//       <div className="space-y-4">
//         <Panel title="Recording details" bodyClassName="space-y-2.5 text-sm">
//           {[
//             ["Status", recording?.status === "ready" ? "Processed · ready" : recording?.status || "Unavailable"],
//             ["Duration", formatClock(recording?.durationSec || 0)],
//             ["File size", recording?.sizeMb ? `${recording.sizeMb} MB` : "—"],
//             ["Transcript", recording?.status === "ready" ? "Synced" : "Pending"],
//           ].map(([k, v]) => (
//             <div key={k} className="flex justify-between">
//               <span className="text-slate-500">{k}</span>
//               <span className="font-medium text-slate-900" data-testid={`recording-${k.toLowerCase().replace(" ", "-")}`}>
//                 {v}
//               </span>
//             </div>
//           ))}
//         </Panel>

//         <Panel title="Chapters" bodyClassName="p-2">
//           {markers.length ? (
//             markers.map((m, i) => (
//               <button
//                 key={m?.at ?? i}
//                 onClick={() => onOpenVideo(m?.at || 0)}
//                 disabled={recording?.status !== "ready"}
//                 className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
//                 data-testid={`chapter-${m?.at ?? i}`}
//               >
//                 <span className="font-mono text-xs text-blue-600">{formatClock(m?.at || 0)}</span>
//                 <span className="text-slate-700">{m?.label || "Chapter"}</span>
//               </button>
//             ))
//           ) : (
//             <p className="px-3 py-2 text-sm text-slate-500">No chapters available.</p>
//           )}
//         </Panel>
//       </div>
//     </div>
//   );
// }

// export { downloadResume };

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

  return (
    interview?.Message ||
    interview?.messages ||
    detail?.Message ||
    detail?.messages ||
    []
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
                  weaknesses={report?.weaknesses?.slice?.(0, 3) || []}
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
                        key={skill?.name || index}
                        {...skill}
                        compact
                      />
                    ) : (
                      <Chip key={skill?.name || index}>
                        {skill?.name || "Skill"}
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

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Strongest evaluated skill
            </p>
            <p className="mt-1.5 font-semibold text-slate-950">
              {sortedSkills[0]?.name || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs text-slate-500">
              Skills distribution
            </p>

            {scoredSkills.length ? (
              <div className="flex h-24 items-end gap-1.5">
                {scoredSkills.map((skill, index) => (
                  <motion.div
                    key={skill?.name || index}
                    title={`${skill?.name || "Skill"}: ${skill?.score}`}
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
  const messages = getMessages(detail);
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

  const exportReport = () => {
    const content =
      typeof reportRecord?.content === "string"
        ? reportRecord.content
        : JSON.stringify(report, null, 2);

    const blob = new Blob([content || ""], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `interview-report-${interview?.id || "report"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
          variant="outline"
          size="sm"
          onClick={exportReport}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
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
          weaknesses={report?.weaknesses || []}
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
            note={report?.recommendationNote}
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
