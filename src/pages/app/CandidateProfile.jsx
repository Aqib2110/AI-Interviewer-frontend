import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Linkedin, Eye, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, KeyValue } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import { DetailSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { Avatar } from "@/components/common/Avatar";
import { StatusBadge, RecommendationBadge } from "@/components/common/Badges";
import { ScoreRing, ScorePill } from "@/components/common/ScoreRing";
import { SkillBar } from "@/components/common/SkillBar";
import { ResumeDocument, ResumeModal, downloadResume } from "@/components/media/Resume";
import { Summary } from "@/components/interviews/ReportBlocks";
import { candidatesService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const { scope } = useSession();
  const { data, loading, error, reload } = useAsync(() => candidatesService.getProfile(id, scope), [id, scope.orgId]);
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <Restricted perm="candidate:view">
      <Link to="/app/candidates" className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" data-testid="back-to-candidates-link"><ArrowLeft className="h-4 w-4" /> Candidates</Link>
      {loading && <DetailSkeleton />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (() => {
        const { candidate: c, interviews, resume, latestReport: r } = data;
        return (
          <div className="space-y-6" data-testid="candidate-profile">
            <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
              <Avatar name={c.name} size="xl" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-slate-950" data-testid="candidate-profile-name">{c.name}</h1>
                <p className="mt-1 text-slate-600">{c.currentTitle}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
                  <KeyValue label="Email" icon={Mail}>{c.email}</KeyValue>
                  <KeyValue label="Phone" icon={Phone}>{c.phone}</KeyValue>
                  <KeyValue label="Location" icon={MapPin}>{c.location}</KeyValue>
                  <KeyValue label="Experience" icon={Briefcase}>{c.experience}</KeyValue>
                  <KeyValue label="LinkedIn" icon={Linkedin}>{c.linkedin || "—"}</KeyValue>
                </dl>
              </div>
              {r && <div className="flex flex-col items-center gap-2"><ScoreRing score={r.score} size={112} stroke={9} /><RecommendationBadge value={r.recommendation} /></div>}
            </section>
            <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6">
                <Panel title="Interview history" description={`${interviews.length} interview${interviews.length !== 1 ? "s" : ""}`} bodyClassName="p-2">
                  {interviews.map((iv) => (
                    <Link key={iv.id} to={`/app/interviews/${iv.id}`} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-50" data-testid={`profile-interview-${iv.id}`}>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900">{iv.title}</p><p className="text-xs text-slate-500">{formatDate(iv.interviewDate || iv.createdAt)}{iv.durationMin && ` · ${iv.durationMin} min`}</p></div>
                      <StatusBadge status={iv.status} /><ScorePill score={iv.overallScore} /><ArrowRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  ))}
                </Panel>
                {r ? (
                  <Panel title={`Latest evaluation · ${r.role}`} actions={<Link to={`/app/interviews/${r.interviewId}`} className="text-xs font-medium text-blue-600 hover:underline">Open report</Link>}>
                    <Summary text={r.summary} />
                    <div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">{r.skills.map((s) => <SkillBar key={s.name} {...s} compact />)}</div>
                  </Panel>
                ) : <EmptyState title="Not evaluated yet" description="Scores and the AI summary will appear after the candidate completes an interview." />}
              </div>
              <Panel title="Resume" description={resume?.fileName} actions={resume && <div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => setResumeOpen(true)} data-testid="profile-view-resume-button"><Eye className="mr-1.5 h-3.5 w-3.5" />View</Button><Button size="sm" variant="outline" onClick={() => downloadResume(resume)} data-testid="profile-download-resume-button"><Download className="h-3.5 w-3.5" /></Button></div>} bodyClassName="bg-slate-100 p-4">
                {resume ? <ResumeDocument resume={resume} name={c.name} contact={`${c.email} · ${c.location}`} className="px-6 py-6" /> : <p className="py-8 text-center text-sm text-slate-500">No resume provided.</p>}
              </Panel>
            </div>
            <ResumeModal open={resumeOpen} onOpenChange={setResumeOpen} resume={resume} candidate={c} />
          </div>
        );
      })()}
    </Restricted>
  );
}
