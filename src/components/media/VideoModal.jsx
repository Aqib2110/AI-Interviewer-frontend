import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "./VideoPlayer";
import { formatClock, formatDate } from "@/lib/format";

export function VideoModal({ open, onOpenChange, recording, interview, startAt = 0 }) {
  if (!recording) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 border-slate-800 bg-slate-950 p-0 text-white sm:rounded-xl" data-testid="video-modal">
        <DialogHeader className="space-y-0.5 px-5 pb-3 pt-4 text-left">
          <DialogTitle className="text-base font-semibold">{interview.candidate.name} — {interview.role}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Recorded {formatDate(interview.interviewDate)} · {formatClock(recording.durationSec)} · {recording.markers.length} chapters
          </DialogDescription>
        </DialogHeader>
        <div className="px-3 pb-3">
          <VideoPlayer recording={recording} candidateName={interview.candidate.name} large startAt={startAt} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
