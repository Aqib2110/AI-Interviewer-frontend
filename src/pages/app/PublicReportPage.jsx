import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MousePointerClick, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewList } from "@/components/interviews/InterviewList";
import { InterviewDetail } from "@/components/interviews/InterviewDetail";
import { EmptyState } from "@/components/common/States";
import { interviewsService } from "@/services";
import { useAsync, useMediaQuery } from "@/hooks/useAsync";
import { CandidateHeader } from "@/components/interviews/CandidateHeader";
import { TABS } from "@/components/interviews/InterviewDetail";
import { DetailSkeleton } from "@/components/common/States";
import { ErrorState } from "@/components/common/States";
import { useSession } from "@/context/SessionContext";
import { Tabs,TabsList,TabsContent,TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { VideoModal } from "@/components/media/VideoModal";
import { ResumeModal } from "@/components/media/Resume";
import { useState } from "react";

export default function InterviewsPage() {  
    const [tab, setTab] = useState("overview");
    const [video, setVideo] = useState({ open: false, at: 0 });
    const [resumeOpen, setResumeOpen] = useState(false);
    const { shareToken } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
   const { data, loading, error, reload } = useAsync(() => interviewsService.getPublicReport(shareToken), [shareToken]);
  const onBack = ()=>{navigate("/")}
  const Active = TABS.find((t) => t.key === tab)?.C ?? OverviewTab;
  
    const openVideo = (at = 0) => {
      if (data?.recording?.status === "ready") {
        setVideo({ open: true, at });
      }
    };
    if (loading) return <DetailSkeleton />;
    if (error) return <ErrorState error={error} onRetry={reload} />;


  return (
       <div className="space-y-5" data-testid="interview-detail">
         <CandidateHeader
           interview={data?.candidate}
           onBack={onBack}
           hasResume={!!data?.candidate?.resume}
           onOpenResume={() => setResumeOpen(true)}
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
               goTab={setTab}
               onOpenVideo={openVideo}
               onOpenResume={() => setResumeOpen(true)}
             />
           </motion.div>
         </AnimatePresence>
   
         <VideoModal
           open={video.open}
           startAt={video.at}
           onOpenChange={(open) =>
             setVideo((v) => ({ ...v, open }))
           }
           recording={data?.recording}
           interview={data?.candidate?.interview}
         />
   
         <ResumeModal
           open={resumeOpen}
           onOpenChange={setResumeOpen}
           resume={data?.candidate?.resume}
           candidate={data?.candidate?.resume}
         />
       </div>
     );
}
