"use client";

import { useMemo, useRef } from "react";
import { VideoPlayer } from "./VideoPlayer";

export function formatOffset(ms) {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

function groupBySegment(messages) {
  const bySegment = new Map();

  for (const message of messages ?? []) {
    if (!message?.aiMsg) continue;

    const key = message.segmentId ?? "default";

    if (!bySegment.has(key)) bySegment.set(key, []);

    bySegment.get(key).push(message);
  }

  return [...bySegment.entries()]
    .map(([segmentId, items]) => ({
      segmentId,
      items: [...items].sort((a, b) => a.askedAtMs - b.askedAtMs),
    }))
    .sort(
      (a, b) =>
        new Date(a.items[0].askedAt).getTime() -
        new Date(b.items[0].askedAt).getTime()
    );
}

export function VideoModal({ recording, interview, startAt = 0, messages }) {
  const playerRef = useRef(null);

  const groups = useMemo(() => groupBySegment(messages), [messages]);

  if (!recording) return null;

  const multipleParts = groups.length > 1;

  const goTo = (message, groupIndex) => {
    playerRef.current?.seekToSegment({
      segmentId: message.segmentId,
      fallbackIndex: groupIndex,
      seconds: message.askedAtMs / 1000,
    });
  };

  return (
    <div className="space-y-4">
      <VideoPlayer
        playerRef={playerRef}
        recording={{
          videoUrls: recording.videoUrls,
          status: recording.status,
        }}
        candidateName={interview?.candidate?.name}
        large
        startAt={startAt}
      />

      {groups.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Chapters
          </h3>

          <div className="space-y-4">
            {groups.map((group, groupIndex) => (
              <div key={group.segmentId}>
                {multipleParts && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Part {groupIndex + 1}
                  </p>
                )}

                <ol className="space-y-1">
                  {group.items.map((message, index) => (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => goTo(message, groupIndex)}
                        className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-blue-700">
                          {formatOffset(message.askedAtMs)}
                        </span>

                        <span className="min-w-0 text-sm text-slate-800">
                          <span className="mr-1 text-slate-400">
                            {index + 1}.
                          </span>
                          {message.aiMsg}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}