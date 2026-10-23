import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Upload, RefreshCw, Eye, Download, CheckCircle2, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, Panel } from "@/components/common/Layout";
import { DetailSkeleton, ErrorState, EmptyState } from "@/components/common/States";
import { Chip } from "@/components/common/Badges";
import { ResumeDocument, ResumeModal, downloadResume } from "@/components/media/Resume";
import { resumesService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";

export default function ResumePage() {
  const { user } = useSession();
  const { data, loading, error, reload, setData } = useAsync(() => resumesService.getCurrent(user.token), []);
  const [uploading, setUploading] = useState(0);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(8);
    const tick = setInterval(() => setUploading((p) => Math.min(92, p + 14)), 220);
    try {
      const next = await resumesService.upload(file, user.token);
      setData(next);
      toast.success("Resume uploaded", { description: `${file.name} was parsed successfully.` });
    } catch (e) {
      toast.error(e.message);
    } finally {
      clearInterval(tick);
      setUploading(0);
    }
  };

  const picker = <input ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => upload(e.target.files[0])} data-testid="resume-file-input" />;

  return (
    <div data-testid="resume-page">
      <PageHeader eyebrow="Personal account" title="Resume" description="Your resume helps the AI interviewer tailor questions to your experience." actions={data?.resume?.length && <Button onClick={() => input.current.click()} disabled={!!uploading} data-testid="upload-new-resume-button"><Upload className="mr-1.5 h-4 w-4" /> Upload new resume</Button>} />
      {picker}
      {loading && <DetailSkeleton />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && !data?.resume?.length && <EmptyState icon={FileText} title="No resume yet" description="Upload a PDF or DOCX up to 10 MB." action={<Button onClick={() => input.current.click()}>Upload resume</Button>} />}
      {(
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Panel title="Preview" bodyClassName="bg-slate-100 p-4 sm:p-8">
            <ResumeDocument resume={data?.resume[0]}  />
          </Panel>
          <div className="space-y-6">
            <Panel title="Current resume" testId="current-resume-card">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 font-mono text-[10px] font-semibold text-rose-600">PDF</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900" data-testid="current-resume-filename">{data?.fileName}</p>
                  <p className="text-xs text-slate-500">Uploaded {formatDate(data?.uploadedAt)} · {data?.sizeKb} KB</p>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Active for new interviews</p>
                </div>
              </div>
              {uploading > 0 && <div className="mt-4 space-y-1.5" data-testid="resume-upload-progress"><Progress value={uploading} className="h-1.5" /><p className="text-xs text-slate-500">Uploading and parsing…</p></div>}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(true)} data-testid="view-resume-button"><Eye className="mr-1 h-3.5 w-3.5" />View</Button>
                <Button variant="outline" size="sm" onClick={() => downloadResume(data)} data-testid="download-resume-button"><Download className="mr-1 h-3.5 w-3.5" />Save</Button>
                <Button variant="outline" size="sm" onClick={() => input.current.click()} disabled={!!uploading} data-testid="replace-resume-button"><RefreshCw className="mr-1 h-3.5 w-3.5" />Replace</Button>
              </div>
            </Panel>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
              onClick={() => input.current.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${drag ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`} data-testid="resume-dropzone"
            >
              <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-800">Drop a new resume here</p>
              <p className="text-xs text-slate-500">PDF or DOCX, up to 10 MB</p>
            </div>
            <Panel title="What we extracted" description="Used to personalise interview questions">
              <div className="flex flex-wrap gap-1.5">{data?.resume?.skills?.map((s) => <Chip key={s}>{s}</Chip>)}</div>
              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-500"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />Your resume is never shared with organizations unless you choose to attach it to an interview.</p>
            </Panel>
          </div>
        </div>
      )}
      <ResumeModal open={open} onOpenChange={setOpen} resume={data} candidate={{ name: user?.name, email: user?.email, phone: user?.phone, location: user?.location, experience: "11 years" }} />
    </div>
  );
}
