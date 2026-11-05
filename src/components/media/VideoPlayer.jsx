
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Circle,
} from "lucide-react";
import { formatClock, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Waveform({
  bars = 18,
  className,
  color = "bg-blue-400",
}) {
  return (
    <span
      className={cn("flex h-6 items-center gap-[3px]", className)}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("wave-bar w-[3px] rounded-full", color)}
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            animationDelay: `${(i % 6) * 0.12}s`,
          }}
        />
      ))}
    </span>
  );
}

export function CandidateFeed({ name, className }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-[#0d1320]",
        className
      )}
    >
      <div className="absolute inset-0 grid-lines opacity-60" />

      <svg
        viewBox="0 0 400 225"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <ellipse cx="200" cy="250" rx="120" ry="78" fill="#1c2638" />
        <circle cx="200" cy="112" r="44" fill="#243149" />
      </svg>

      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-semibold text-slate-400/80">
        {initials(name)}
      </span>
    </div>
  );
}

export function VideoPlayer({
  recording,
  durationMinutes,
  candidateName,
  large = false,
  startAt = 0,
  onExpand,
}) {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(startAt);
 const [duration, setDuration] = useState(0);

const total =
  duration > 0
    ? duration
    : Number(durationMinutes || 0) * 60;

  const [error, setError] = useState("");

  const videoUrl =
    recording?.videoUrl || recording?.url || null;

  const markers = Array.isArray(recording?.markers)
    ? recording.markers
    : [];

  const live = recording?.status === "recording";


  const progress =
    total > 0
      ? Math.min(100, Math.max(0, (time / total) * 100))
      : 0;

  // Reset the player when the recording changes.
  useEffect(() => {
    const video = videoRef.current;

    setPlaying(false);
    setError("");
    setTime(Math.max(0, startAt || 0));
    setDuration(Number(recording?.durationSec) || 0);

    if (video) {
      video.pause();
      video.currentTime = Math.max(0, startAt || 0);
    }
  }, [videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted]);

 const updateDuration = (video) => {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    setDuration(video.duration);
    return;
  }

  if (video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);

    if (Number.isFinite(end) && end > 0) {
      setDuration(end);
    }
  }
};

  const handleLoadedMetadata = (event) => {
    const video = event.currentTarget;

    updateDuration(video);

    const initialTime = Math.max(
      0,
      Math.min(startAt || 0, video.duration || 0)
    );

    if (initialTime > 0) {
      video.currentTime = initialTime;
    }

    setTime(initialTime);
    setError("");
  };

  const seekTo = (seconds) => {
    const video = videoRef.current;

    if (!video || live || !Number.isFinite(seconds)) {
      return;
    }

    const max = Number.isFinite(video.duration)
      ? video.duration
      : total;

    if (max <= 0) return;

    const nextTime = Math.max(0, Math.min(seconds, max));

    try {
      video.currentTime = nextTime;
      setTime(nextTime);
      setError("");
    } catch {
      setError("Unable to seek this recording.");
    }
  };

  const seekFromPointer = (event) => {
    if (live || !total) return;

    const rect = timelineRef.current?.getBoundingClientRect();

    if (!rect || rect.width <= 0) return;

    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );

    seekTo(ratio * total);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video || live || !videoUrl) return;

    if (video.paused) {
      try {
        await video.play();
        setError("");
      } catch {
        setPlaying(false);
        setError(
          "Unable to play this recording. Check the video URL and permissions."
        );
      }
    } else {
      video.pause();
    }
  };

  const activeMarker = markers
    .filter((item) => Number(item?.at) <= time)
    .at(-1);

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
      data-testid={large ? "video-player-large" : "video-player-inline"}
    >
      {/* Video */}
      <div
        className={cn(
          "relative aspect-video bg-slate-950",
          !large && onExpand && "cursor-pointer"
        )}
        onClick={
          !large && onExpand
            ? () => onExpand(time)
            : undefined
        }
        data-testid="video-stage"
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 h-full w-full object-contain"
            playsInline
            preload="metadata"
onLoadedMetadata={(event) => {
  const video = event.currentTarget;
  updateDuration(video);

  if (startAt > 0) {
    video.currentTime = startAt;
    setTime(startAt);
  }
}}
onDurationChange={(event) => {
  updateDuration(event.currentTarget);
}}
onProgress={(event) => {
  updateDuration(event.currentTarget);
}}
onTimeUpdate={(event) => {
  setTime(event.currentTarget.currentTime);
}}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => {
              setPlaying(false);
              setError("The recording could not be loaded.");
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-slate-400">
            <Circle className="h-8 w-8" />
            <p>Recording URL is not available.</p>
            <p className="text-xs">
              A storage key alone cannot play a recording.
            </p>
          </div>
        )}

        {/* Video labels */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-rose-600 px-2 py-0.5 font-mono text-[10px] font-medium text-white">
              <Circle className="h-2 w-2 animate-pulse fill-white" />
              LIVE · RECORDING
            </span>
          ) : (
            <span className="rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] text-slate-200">
              REC · {formatClock(total)}
            </span>
          )}

          <span className="rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {candidateName || "Candidate"}
          </span>
        </div>

        {activeMarker && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-[11px] text-white">
            {activeMarker.label || "Chapter"}
          </span>
        )}

        {!playing && !live && videoUrl && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void togglePlayback();
            }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label="Play recording"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-lg transition-transform hover:scale-105">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </button>
        )}

        {!large && onExpand && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[11px] text-white">
            Watch interview
          </span>
        )}
      </div>

      {error && (
        <p className="px-4 pt-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      {/* Timeline and controls */}
      <div className="space-y-2.5 px-4 pb-3 pt-3">
        {/* <div
          ref={timelineRef}
          className={cn(
            "relative h-6 select-none touch-none",
            !live && total > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          )}
          data-testid="video-timeline"
          onPointerDown={(event) => {
            if (live || !videoUrl || total <= 0) return;

            // Don't intercept clicks on chapter markers.
            if (event.target.closest("button")) return;

            seekFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (
              event.buttons === 1 &&
              !live &&
              videoUrl &&
              total > 0
            ) {
              seekFromPointer(event);
            }
          }}
        > */}
          {/* Background */}
          {/* <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-800" /> */}

          {/* Progress */}
          {/* <div
            className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-500"
            style={{ width: `${progress}%` }}
          /> */}

          {/* Draggable range input */}
        <div className="px-1 py-2" data-testid="video-timeline">
  <input
    type="range"
    min={0}
    max={duration > 0 ? duration : 1}
    step={0.1}
    value={Math.min(time, duration || 0)}
    disabled={live || !videoUrl || duration <= 0}
    onChange={(e) => {
      const video = videoRef.current;
      const nextTime = Number(e.target.value);

      if (!video || !Number.isFinite(nextTime)) return;

      video.currentTime = nextTime;
      setTime(nextTime);
    }}
    aria-label="Seek video"
    className="block w-full cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
  />
</div>

          {/* Chapter markers */}
          {markers.map((item, index) => {
            const position =
              total > 0
                ? Math.max(
                    0,
                    Math.min(100, (Number(item.at) / total) * 100)
                  )
                : 0;

            return (
              <button
                key={item.at ?? index}
                type="button"
                title={item.label || "Chapter"}
                aria-label={`Seek to ${item.label || "chapter"}`}
                disabled={live || !videoUrl || total <= 0}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  seekTo(Number(item.at) || 0);
                }}
                className="absolute top-1/2 z-30 h-3 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-slate-400 hover:bg-white disabled:cursor-not-allowed"
                style={{ left: `${position}%` }}
              />
            );
          })}

          {/* Visible playhead */}
          <div
            className="pointer-events-none absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1 text-slate-300">
          <Ctl
            onClick={() => void togglePlayback()}
            disabled={live || !videoUrl}
            label={playing ? "Pause" : "Play"}
            testId="video-play-toggle"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Ctl>

          <Ctl
            onClick={() => seekTo(time - 10)}
            disabled={live || !videoUrl || total <= 0}
            label="Back 10s"
          >
            <RotateCcw className="h-4 w-4" />
          </Ctl>

          <Ctl
            onClick={() => seekTo(time + 10)}
            disabled={live || !videoUrl || total <= 0}
            label="Forward 10s"
          >
            <RotateCw className="h-4 w-4" />
          </Ctl>

          <Ctl
            onClick={() => setMuted((value) => !value)}
            label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Ctl>

          <span
            className="ml-2 font-mono text-xs tabular-nums text-slate-400"
            data-testid="video-time"
          >
            {formatClock(time)} / {formatClock(total)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setSpeed((value) =>
                  value >= 2 ? 1 : value + 0.5
                )
              }
              className="rounded px-2 py-1 font-mono text-xs text-slate-300 hover:bg-white/10"
              data-testid="video-speed-button"
            >
              {speed}x
            </button>

            {onExpand && !large && (
              <Ctl
                onClick={() => onExpand(time)}
                label="Expand"
                testId="video-expand-button"
              >
                <Maximize2 className="h-4 w-4" />
              </Ctl>
            )}
          </div>
        </div>
      </div>
  );
}

const Ctl = ({
  children,
  onClick,
  disabled,
  label,
  testId,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    data-testid={testId}
    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
  >
    {children}
  </button>
);
