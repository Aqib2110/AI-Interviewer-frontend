import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interviewsService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { DetailSkeleton, ErrorState } from "@/components/common/States";
import { VideoModal } from "@/components/media/VideoModal";
import { ResumeDocument, ResumeModal } from "@/components/media/Resume";
import { CandidateHeader } from "./CandidateHeader";
import { Button } from "../ui/button";
import { Eye,Download } from "lucide-react";
import { Panel } from "../common/Layout";
import {
  OverviewTab,
  SkillsTab,
  TranscriptTab,
  ReportTab,
  RecordingTab,
} from "./DetailTabs";
import { useSession } from "@/context/SessionContext";
import { div } from "three/src/nodes/math/OperatorNode.js";

export const TABS = [
  { key: "overview", label: "Overview", C: OverviewTab },
  { key: "skills", label: "Skills", C: SkillsTab },
  { key: "transcript", label: "Interview", C: TranscriptTab },
  { key: "report", label: "Report", C: ReportTab },
  { key: "recording", label: "Recording", C: RecordingTab },
];

export function InterviewDetail({ id, onBack }) {
  const { context } = useSession();
  const isOrganization = context === "organization";

  const { data, loading, error, reload } = useAsync(
    () => interviewsService.getDetail(id, context),
    [id, context]
  );


  console.log(data, "data");

  const [tab, setTab] = useState("overview");
  const [video, setVideo] = useState({ open: false, at: 0 });
  const [resumeOpen, setResumeOpen] = useState(false);

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const Active = TABS.find((t) => t.key === tab)?.C ?? OverviewTab;
  const resume = data?.candidate?.interviewcandidate?.resume;
  const candidate = data?.candidate?.interviewcandidate;
  const openVideo = (at = 0) => {
    const urls = data?.candidate?.videoUrls;
    console.log(data.candidate.videoUrls, "videosssss")
    const hasVideo = Array.isArray(urls) ? urls.length > 0 : Boolean(urls);

    if (!hasVideo) return;

    setVideo({ open: true, at });
  };

  return (
    <div className="space-y-5" data-testid="interview-detail">
      <CandidateHeader
        interview={data?.candidate}
        onBack={onBack}
        hasResume={!!data?.candidate?.resume}
        onOpenResume={() => setResumeOpen(true)}
        isOrganization={isOrganization}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList className="h-10 bg-slate-100/80">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="px-3.5 text-[13px]"
                data-testid={`interview-tab-${t.key}`}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Active
            detail={data?.candidate}
            context={context}
            goTab={setTab}
            onOpenVideo={openVideo}
            onOpenResume={() => setResumeOpen(true)}
            isOrganization={isOrganization}
          />
        </motion.div>
      </AnimatePresence>

      {
        tab === "overview" &&
        <>
          <VideoModal
            open={video?.open}
            startAt={video?.at}
            onOpenChange={(open) =>
              setVideo((v) => ({ ...v, open }))
            }
            recording={data?.candidate}
            interview={data?.candidate}
            messages={data?.candidate?.Message}
          />
          {resume && (
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
                    name={candidate}
                    contact={`${candidate.email ?? ""}${candidate.location ? ` · ${candidate.location}` : ""}`}
                    className="px-6 py-6"
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No resume provided.
                  </p>
                )}
              </Panel>
          )}
          <ResumeModal
            open={resumeOpen}
            onOpenChange={setResumeOpen}
            resume={data?.candidate?.interviewcandidate?.resume}
            candidate={data?.candidate?.interviewcandidate}
          />
        </>
      }
    </div>
  );
}