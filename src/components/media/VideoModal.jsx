import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "./VideoPlayer";
import { formatClock, formatDate } from "@/lib/format";
import { record } from "zod";

export function VideoModal({ open, onOpenChange, recording, interview, startAt = 0 }) {
  if (!recording) return null;
  console.log("recordsss",recording)
  return (
    <>
          <VideoPlayer recording={{
            videoUrls:recording.videoUrls,
            status: recording.status
          }} candidateName={interview?.candidate?.name} large startAt={startAt} />
    </>
  );
}
