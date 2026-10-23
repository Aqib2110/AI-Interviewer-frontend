import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/common/Badges";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";


export function ResumeDocument({ resume, className }) {
  if (!resume?.fileUrl) {
    return (
      <div className={cn("p-6 text-center text-slate-500", className)}>
        No resume PDF available.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200",
        className
      )}
      data-testid="resume-document"
    >
      <iframe
        src={`https://pub-2e73a73f0b1849d1bd14461731a54ad5.r2.dev/${resume?.fileKey}`}
        title="Resume PDF"
        className="h-[800px] w-full border-0"
      />
    </div>
  );
}


export const downloadResume = (resume) => toast.success(`Downloading ${resume.fileName}`, { description: "Demo only — file storage isn't connected yet." });

export function ResumeModal({ open, onOpenChange, resume, candidate }) {
  if (!resume) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0" data-testid="resume-modal">
        <div className="grid max-h-[90vh] md:grid-cols-[1fr_280px]">
          <div className="overflow-y-auto bg-slate-100 p-4 sm:p-8 scrollbar-thin">
            <ResumeDocument resume={resume} name={candidate?.name} contact={`${candidate?.email} · ${candidate?.phone} · ${candidate?.location}`} />
          </div>
          <aside className="overflow-y-auto border-l border-slate-200 p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-slate-500" /> Resume</DialogTitle>
              <DialogDescription className="break-all text-xs">{resume?.fileName}</DialogDescription>
            </DialogHeader>
            <dl className="mt-5 space-y-3 text-sm">
              {[["Uploaded", formatDate(resume?.uploadedAt)], ["Size", `${resume?.sizeKb} KB · ${resume?.pages} page${resume?.pages > 1 ? "s" : ""}`], ["Experience", candidate.experience]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mb-2 mt-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">Parsed skills</p>
            <div className="flex flex-wrap gap-1.5">{resume?.skills?.map((s) => <Chip key={s}>{s}</Chip>)}</div>
            <Button className="mt-7 w-full" onClick={() => downloadResume(resume)} data-testid="resume-modal-download-button"><Download className="mr-2 h-4 w-4" /> Download resume</Button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
