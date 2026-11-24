import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PanelTopOpen,
  Circle,
} from "lucide-react";
import { formatClock, initials } from "@/lib/format";
import { cn } from "@/lib/utils";


const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function normalizeSegments(recording) {
  const raw =
    recording?.videoUrls ??
    recording?.urls ??
    recording?.videoUrl ??
    recording?.url ??
    null;

  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return list
    .map((item) =>
      typeof item === "string"
        ? { url: item, duration: 0, segmentId: null }
        : {
            url: item?.url,
            duration: Number(item?.duration ?? item?.durationSec) || 0,
            segmentId: item?.segmentId ?? null,
          }
    )
    .filter((s) => Boolean(s.url));
}

function afterFrame(video, fn) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };

  if (typeof video.requestVideoFrameCallback === "function") {
    video.requestVideoFrameCallback(run);
    setTimeout(run, 250);
  } else {
    run();
  }
}

function CaptionOverlay({ messages, time, isFullscreen = false }) {
  const questions = useMemo(
    () =>
      (Array.isArray(messages) ? messages : [])
        .filter((m) => m?.aiMsg && Number.isFinite(Number(m.askedAtMs)))
        .map((m) => ({ ...m, startSec: Number(m.askedAtMs) / 1000 }))
        .sort((a, b) => a.startSec - b.startSec),
    [messages]
  );

  const current = useMemo(() => {
    let found = null;
    for (const q of questions) {
      if (q.startSec <= time) found = q;
      else break;
    }
    return found;
  }, [questions, time]);

  if (!current) return null;

 return (
  <div
    className={cn(
      "pointer-events-none absolute z-10 flex justify-center",
      isFullscreen ? "inset-x-3 bottom-10" : "inset-x-2 bottom-2 sm:bottom-3"
    )}
  >
    <p
      key={current.id ?? current.startSec}
      className={cn(
        "rounded-md bg-black/70 text-center leading-snug text-white",
        isFullscreen
          ? "max-w-[90%] px-3 py-2 text-sm"
          : "line-clamp-2 max-w-full px-2 py-1 text-xs sm:max-w-[90%] sm:px-3 sm:py-2 sm:text-sm"
      )}
      data-testid="video-caption"
    >
      {current.aiMsg}
    </p>
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
  playerRef,
  recordingMode,
  messages,
  setduration = () => {},
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rawSegments = normalizeSegments(recording);
  const segKey = JSON.stringify(rawSegments);
  const segments = useMemo(() => rawSegments, [segKey]);
  const urls = segments.map((s) => s.url);

  const live = recording?.status === "recording";

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(startAt);
  const [error, setError] = useState("");

  const [active, setActive] = useState(0);
  const [slots, setSlots] = useState([0, segments.length > 1 ? 1 : -1]);
  const [durations, setDurations] = useState(() =>
    segments.map((s) => s.duration)
  );

  const containerRef = useRef(null);
  const videoRefs = useRef([null, null]);
  const activeRef = useRef(0);
  const segRef = useRef(0);
  const slotsRef = useRef([0, segments.length > 1 ? 1 : -1]);
  const playingRef = useRef(false);
  const pendingRef = useRef(null);
  const startRef = useRef(0);
  const urlsRef = useRef(urls);
  const offsetsRef = useRef([]);
  const durationsRef = useRef(durations);
  const totalRef = useRef(0);
  const pendingSegSeekRef = useRef(null);

  const offsets = useMemo(() => {
    let acc = 0;
    return durations.map((d) => {
      const start = acc;
      acc += d || 0;
      return start;
    });
  }, [durations]);

  const knownSum = durations.reduce((a, d) => a + (d || 0), 0);
  const allKnown = durations.length > 0 && durations.every((d) => d > 0);
  const fallbackTotal =
    Number(recording?.durationSec) || Number(durationMinutes || 0) * 60;
  const total = allKnown ? knownSum : Math.max(knownSum, fallbackTotal);

  urlsRef.current = urls;
  offsetsRef.current = offsets;
  durationsRef.current = durations;
  totalRef.current = total;

  useEffect(() => {
    setduration(total);
  }, [total]);

  const setDurationFor = (idx, value) => {
    if (idx < 0 || !Number.isFinite(value) || value <= 0) return;
    setDurations((prev) => {
      if (Math.abs((prev[idx] || 0) - value) < 0.01) return prev;
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const updateDuration = (slot, video) => {
    const idx = slotsRef.current[slot];
    if (idx < 0) return;

    let d = video.duration;
    if (!(Number.isFinite(d) && d > 0) && video.seekable.length > 0) {
      d = video.seekable.end(video.seekable.length - 1);
    }
    setDurationFor(idx, d);
  };

  const locate = (t) => {
    const offs = offsetsRef.current;
    const durs = durationsRef.current;

    let idx = 0;
    for (let i = 0; i < offs.length; i++) {
      if (t >= offs[i]) idx = i;
    }

    const local = Math.max(0, t - (offs[idx] || 0));
    const d = durs[idx];
    return { idx, local: d > 0 ? Math.min(local, d) : local };
  };

  const commitSwap = (slot, idx) => {
    const prev = activeRef.current;

    activeRef.current = slot;
    segRef.current = idx;

    const nextIdx = idx + 1 < urlsRef.current.length ? idx + 1 : -1;
    const nextSlots = [...slotsRef.current];
    nextSlots[slot] = idx;
    nextSlots[prev] = nextIdx;
    slotsRef.current = nextSlots;

    setActive(slot);
    setSlots(nextSlots);

    const nv = videoRefs.current[slot];
    if (nv) {
      setTime((offsetsRef.current[idx] || 0) + nv.currentTime);
      setPlaying(!nv.paused);
      playingRef.current = !nv.paused;
    }

    videoRefs.current[prev]?.pause();
  };

  const finishPending = () => {
    const p = pendingRef.current;
    if (!p || p.finishing) return;

    const v = videoRefs.current[p.slot];
    if (!v || slotsRef.current[p.slot] !== p.idx || v.readyState < 2) return;

    if (Math.abs(v.currentTime - p.local) > 0.05) {
      if (!p.seeking) {
        p.seeking = true;
        try {
          v.currentTime = p.local;
        } catch {
          pendingRef.current = null;
          setError("Unable to seek this recording.");
        }
      }
      return;
    }

    p.finishing = true;

    if (p.autoplay) {
      v.play()
        .then(() =>
          afterFrame(v, () => {
            if (pendingRef.current !== p) return;
            pendingRef.current = null;
            commitSwap(p.slot, p.idx);
          })
        )
        .catch(() => {
          if (pendingRef.current !== p) return;
          pendingRef.current = null;
          commitSwap(p.slot, p.idx);
          setPlaying(false);
          playingRef.current = false;
          setError("Unable to continue playback.");
        });
    } else {
      pendingRef.current = null;
      commitSwap(p.slot, p.idx);
    }
  };

  const queueSwitch = (idx, local, autoplay) => {
    const slot = 1 - activeRef.current;

    videoRefs.current[slot]?.pause();
    pendingRef.current = { slot, idx, local, autoplay, seeking: false };

    if (slotsRef.current[slot] !== idx) {
      const next = [...slotsRef.current];
      next[slot] = idx;
      slotsRef.current = next;
      setSlots(next);
    } else {
      finishPending();
    }
  };

  const seekTo = (seconds, autoplay = playingRef.current) => {
    if (live || urlsRef.current.length === 0 || !Number.isFinite(seconds)) {
      return;
    }

    const max = totalRef.current;
    if (max <= 0) return;

    const t = clamp(seconds, 0, max);
    const { idx, local } = locate(t);

    setTime(t);
    setError("");

    if (idx === segRef.current && !pendingRef.current) {
      const v = videoRefs.current[activeRef.current];
      if (!v) return;

      try {
        v.currentTime = local;
      } catch {
        setError("Unable to seek this recording.");
        return;
      }

      if (autoplay && v.paused) v.play().catch(() => {});
      return;
    }

    queueSwitch(idx, local, autoplay);
  };

  const seekToSegment = ({ segmentId, fallbackIndex = 0, seconds = 0 }) => {
    if (live || urlsRef.current.length === 0) return;

    const byId = segmentId
      ? segments.findIndex((s) => s.segmentId === segmentId)
      : -1;

    const idx = clamp(
      byId >= 0 ? byId : fallbackIndex,
      0,
      urlsRef.current.length - 1
    );

    const known =
      durationsRef.current.length > 0 &&
      durationsRef.current.every((d) => d > 0);

    if (!known) {
      pendingSegSeekRef.current = { idx, seconds };
      return;
    }

    seekTo((offsetsRef.current[idx] || 0) + seconds, true);
  };

  if (playerRef) {
    playerRef.current = { seekTo, seekToSegment };
  }

  const togglePlayback = async () => {
    const video = videoRefs.current[activeRef.current];
    if (!video || live || urlsRef.current.length === 0) return;

    if (pendingRef.current?.autoplay) {
      pendingRef.current.autoplay = false;
      setPlaying(false);
      playingRef.current = false;
      return;
    }

    if (video.paused) {
      if (totalRef.current > 0 && time >= totalRef.current - 0.25) {
        seekTo(0, true);
        return;
      }

      try {
        await video.play();
        setError("");
      } catch {
        setPlaying(false);
        playingRef.current = false;
        setError(
          "Unable to play this recording. Check the video URL and permissions."
        );
      }
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      setError("Fullscreen is not supported here.");
    }
  };

  const handleEnded = (slot) => {
    if (slot !== activeRef.current) return;

    const next = segRef.current + 1;

    if (next < urlsRef.current.length) {
      queueSwitch(next, 0, true);
    } else {
      setPlaying(false);
      playingRef.current = false;
    }
  };

  const handleTimeUpdate = (slot, event) => {
    if (slot !== activeRef.current || pendingRef.current) return;
    setTime(
      (offsetsRef.current[segRef.current] || 0) + event.currentTarget.currentTime
    );
  };

  const handlePlay = (slot) => {
    if (slot !== activeRef.current) return;
    setPlaying(true);
    playingRef.current = true;
  };

  const handlePause = (slot, event) => {
    if (slot !== activeRef.current) return;

    if (
      event.currentTarget.ended &&
      segRef.current + 1 < urlsRef.current.length
    ) {
      return;
    }

    setPlaying(false);
    playingRef.current = false;
  };

  const handleError = (slot, event) => {
    if (!event.currentTarget.getAttribute("src")) return;

    const p = pendingRef.current;
    if (slot === activeRef.current || p?.slot === slot) {
      pendingRef.current = null;
      setPlaying(false);
      playingRef.current = false;
      setError("The recording could not be loaded.");
    }
  };

  useEffect(() => {
    const initialSlots = [0, segments.length > 1 ? 1 : -1];
    const start = Math.max(0, startAt || 0);

    pendingRef.current = null;
    pendingSegSeekRef.current = null;
    activeRef.current = 0;
    segRef.current = 0;
    slotsRef.current = initialSlots;
    playingRef.current = false;
    startRef.current = start;

    setActive(0);
    setSlots(initialSlots);
    setDurations(segments.map((s) => s.duration));
    setPlaying(false);
    setError("");
    setTime(start);

    videoRefs.current.forEach((v) => v && v.pause());
  }, [segments]);

  useEffect(() => {
    if (live) return undefined;

    let cancelled = false;
    const probes = [];

    segments.forEach((seg, i) => {
      if (seg.duration > 0) return;

      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.muted = true;

      const finish = (d) => {
        if (!cancelled) setDurationFor(i, d);
      };

      probe.onloadedmetadata = () => {
        if (Number.isFinite(probe.duration)) {
          finish(probe.duration);
        } else {
          probe.ontimeupdate = () => {
            probe.ontimeupdate = null;
            finish(probe.duration);
          };
          probe.currentTime = 1e101;
        }
      };

      probe.src = seg.url;
      probes.push(probe);
    });

    return () => {
      cancelled = true;
      probes.forEach((p) => {
        p.onloadedmetadata = null;
        p.ontimeupdate = null;
        p.removeAttribute("src");
        p.load();
      });
    };
  }, [segments, live]);

  useEffect(() => {
    if (startRef.current > 0 && allKnown) {
      const t = startRef.current;
      startRef.current = 0;
      seekTo(t, false);
    }

    if (pendingSegSeekRef.current && allKnown) {
      const pending = pendingSegSeekRef.current;
      pendingSegSeekRef.current = null;
      seekTo((offsetsRef.current[pending.idx] || 0) + pending.seconds, true);
    }
  }, [allKnown, offsets]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.defaultPlaybackRate = speed;
      v.playbackRate = speed;
    });
  }, [speed, slots]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) v.muted = muted;
    });
  }, [muted, slots]);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const hasVideo = urls.length > 0;
  const controlsDisabled = live || !hasVideo;
  const seekDisabled = controlsDisabled || total <= 0;
  const stageClickable = !large && onExpand && !isFullscreen;

  const showCaptions = recordingMode === "camera_only";

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-800 bg-slate-950",
        isFullscreen && "flex h-full w-full flex-col rounded-none border-0"
      )}
      data-testid={large ? "video-player-large" : "video-player-inline"}
    >
      <div
        className={cn(
          "relative bg-slate-950",
          isFullscreen ? "min-h-0 flex-1" : "aspect-video",
          stageClickable && "cursor-pointer"
        )}
        onClick={stageClickable ? () => onExpand(time) : undefined}
        data-testid="video-stage"
      >
        {hasVideo ? (
          [0, 1].map((slot) => {
            const idx = slots[slot];
            const src = idx >= 0 ? urls[idx] : undefined;

            return (
              <video
                key={slot}
                ref={(el) => {
                  videoRefs.current[slot] = el;
                }}
                src={src}
                className={cn(
                  "absolute inset-0 h-full w-full object-contain",
                  slot === active
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                )}
                aria-hidden={slot !== active}
                playsInline
                preload="auto"
                onLoadStart={(e) => {
                  e.currentTarget.defaultPlaybackRate = speed;
                  e.currentTarget.playbackRate = speed;
                  e.currentTarget.muted = muted;
                }}
                onLoadedMetadata={(e) => updateDuration(slot, e.currentTarget)}
                onDurationChange={(e) => updateDuration(slot, e.currentTarget)}
                onProgress={(e) => updateDuration(slot, e.currentTarget)}
                onLoadedData={finishPending}
                onCanPlay={finishPending}
                onSeeked={finishPending}
                onTimeUpdate={(e) => handleTimeUpdate(slot, e)}
                onPlay={() => handlePlay(slot)}
                onPause={(e) => handlePause(slot, e)}
                onEnded={() => handleEnded(slot)}
                onError={(e) => handleError(slot, e)}
              />
            );
          })
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-slate-400">
            <Circle className="h-8 w-8" />
            <p>Recording URL is not available.</p>
            <p className="text-xs">
              A storage key alone cannot play a recording.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
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

       {showCaptions && hasVideo && (
  <CaptionOverlay messages={messages} time={time} isFullscreen={isFullscreen} />
)}

        {!playing && !live && hasVideo && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void togglePlayback();
            }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            aria-label="Play recording"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-lg transition-transform hover:scale-105">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </button>
        )}

        {stageClickable && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-black/60 px-2 py-1 text-[11px] text-white">
            Watch interview
          </span>
        )}
      </div>

      {error && <p className="px-4 pt-3 text-sm text-rose-400">{error}</p>}

      <div className="space-y-2.5 px-4 pb-3 pt-3">
        <div className="relative px-1 py-2" data-testid="video-timeline">
          <input
            type="range"
            min={0}
            max={total > 0 ? total : 1}
            step={0.1}
            value={Math.min(time, total || 0)}
            disabled={seekDisabled}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek video"
            className="block w-full cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <Ctl
            onClick={() => void togglePlayback()}
            disabled={controlsDisabled}
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
            disabled={seekDisabled}
            label="Back 10s"
          >
            <RotateCcw className="h-4 w-4" />
          </Ctl>

          <Ctl
            onClick={() => seekTo(time + 10)}
            disabled={seekDisabled}
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
              onClick={() => setSpeed((value) => (value >= 2 ? 1 : value + 0.5))}
              className="rounded px-2 py-1 font-mono text-xs text-slate-300 hover:bg-white/10"
              data-testid="video-speed-button"
            >
              {speed}x
            </button>

            <Ctl
              onClick={() => void toggleFullscreen()}
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              testId="video-fullscreen-button"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Ctl>
          </div>
        </div>
      </div>
    </div>
  );
}

const Ctl = ({ children, onClick, disabled, label, testId }) => (
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

export const ScreenAndCameraPlayer = (props) => (
  <VideoPlayer {...props} recordingMode="screen_and_camera" />
);

export const CameraOnlyPlayer = (props) => (
  <VideoPlayer {...props} recordingMode="camera_only" />
);

export function InterviewPlayer(props) {
  console.log(props?.recordingMode,"mode")
  console.log(props?.messages,"messages")

  return props.recordingMode === "camera_only" ? (
    <CameraOnlyPlayer {...props} />
  ) : (
    <ScreenAndCameraPlayer {...props} />
  );
}