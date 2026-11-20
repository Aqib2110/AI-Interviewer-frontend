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

export function Waveform({ bars = 18, className, color = "bg-blue-400" }) {
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

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Accepts a string, an array of strings, or an array of { url, duration }.
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
        ? { url: item, duration: 0 }
        : {
            url: item?.url,
            duration: Number(item?.duration ?? item?.durationSec) || 0,
          }
    )
    .filter((s) => Boolean(s.url));
}

// Run fn after the video has actually painted a frame (fallback: timeout).
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

/* ------------------------------------------------------------------ */
/* VideoPlayer                                                         */
/* ------------------------------------------------------------------ */

export function VideoPlayer({
  recording,
  durationMinutes,
  candidateName,
  large = false,
  startAt = 0,
  onExpand,
  setduration=()=>{}
}) {

  /* ---------- segments (one per URL) ---------- */
const [isFullscreen, setIsFullscreen] = useState(false);

  const rawSegments = normalizeSegments(recording);
  const segKey = JSON.stringify(rawSegments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => rawSegments, [segKey]);
  const urls = segments.map((s) => s.url);

  const live = recording?.status === "recording";

  /* ---------- state ---------- */

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(startAt); // GLOBAL time across all segments
  const [error, setError] = useState("");

  const [active, setActive] = useState(0); // which <video> is visible (0 | 1)
  const [slots, setSlots] = useState([0, segments.length > 1 ? 1 : -1]); // URL index loaded in each <video>
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

  /* ---------- derived timeline ---------- */

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


  useEffect(()=>{
  setduration(total);
  },[total])
  // const markers = Array.isArray(recording?.markers) ? recording.markers : [];
  // const activeMarker = markers
  //   .filter((item) => Number(item?.at) <= time)
  //   .at(-1);

  /* ---------- low-level helpers ---------- */

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

  /* ---------- the seamless swap ---------- */

  // Make the hidden <video> the visible one.
  const commitSwap = (slot, idx) => {
    const prev = activeRef.current;

    activeRef.current = slot;
    segRef.current = idx;

    const nextIdx = idx + 1 < urlsRef.current.length ? idx + 1 : -1;
    const nextSlots = [...slotsRef.current];
    nextSlots[slot] = idx;
    nextSlots[prev] = nextIdx; // old element now preloads the following URL
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

  // Called from loadeddata / canplay / seeked of either element.
  const finishPending = () => {
    const p = pendingRef.current;
    if (!p || p.finishing) return;

    const v = videoRefs.current[p.slot];
    if (!v || slotsRef.current[p.slot] !== p.idx || v.readyState < 2) return;

    // Need to position the hidden element first?
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
      return; // onSeeked will call us again
    }

    p.finishing = true;

    if (p.autoplay) {
      v.play()
        .then(() =>
          afterFrame(v, () => {
            if (pendingRef.current !== p) return; // superseded by a newer seek
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

  // Load segment `idx` into the hidden element, then swap to it.
  const queueSwitch = (idx, local, autoplay) => {
    const slot = 1 - activeRef.current;

    // cancel any earlier in-flight switch
    videoRefs.current[slot]?.pause();
    pendingRef.current = { slot, idx, local, autoplay, seeking: false };

    if (slotsRef.current[slot] !== idx) {
      const next = [...slotsRef.current];
      next[slot] = idx;
      slotsRef.current = next;
      setSlots(next); // changes src -> loadeddata -> finishPending
    } else {
      finishPending();
    }
  };

  /* ---------- public actions ---------- */

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

  const togglePlayback = async () => {
    const video = videoRefs.current[activeRef.current];
    if (!video || live || urlsRef.current.length === 0) return;

    // user pressed pause while a handoff is in flight
    if (pendingRef.current?.autoplay) {
      pendingRef.current.autoplay = false;
      setPlaying(false);
      playingRef.current = false;
      return;
    }

    if (video.paused) {
      // finished everything -> restart from the beginning
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

  // Real browser fullscreen on the whole player (keeps custom controls)
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

  /* ---------- <video> event handlers ---------- */

  const handleEnded = (slot) => {
    if (slot !== activeRef.current) return;

    const next = segRef.current + 1;

    if (next < urlsRef.current.length) {
      // keep `playing` true -> no UI flicker, hidden element takes over
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

    // the browser fires `pause` right before `ended` – ignore it when
    // another segment is about to take over
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

  /* ---------- effects ---------- */

  // New recording / new URLs -> reset everything
  useEffect(() => {
    const initialSlots = [0, segments.length > 1 ? 1 : -1];
    const start = Math.max(0, startAt || 0);

    pendingRef.current = null;
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
  }, [segments]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read each segment's duration up-front (so the timeline is complete)
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
          // MediaRecorder/webm files report Infinity until you seek to the end
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
  }, [segments, live]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply `startAt` once we know where each segment starts
  useEffect(() => {
    if (startRef.current > 0 && allKnown) {
      const t = startRef.current;
      startRef.current = 0;
      seekTo(t, false);
    }
  }, [allKnown, offsets]); // eslint-disable-line react-hooks/exhaustive-deps

  // Speed (also as default, because changing `src` resets playbackRate)
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

  // Track fullscreen state (also catches the Esc key)
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ---------- render ---------- */

  const hasVideo = urls.length > 0;
  const controlsDisabled = live || !hasVideo;
  const seekDisabled = controlsDisabled || total <= 0;
  const stageClickable = !large && onExpand && !isFullscreen;

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-800 bg-slate-950",
        isFullscreen && "flex h-full w-full flex-col rounded-none border-0"
      )}
      data-testid={large ? "video-player-large" : "video-player-inline"}
    >
      {/* Video */}
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
          // Two stacked elements: one visible, one preloading the next URL.
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

        {/* Video labels */}
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

        {/* {activeMarker && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded bg-black/60 px-2 py-1 text-[11px] text-white">
            {activeMarker.label || "Chapter"}
          </span>
        )} */}

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
        {/* Timeline (combined across all URLs) */}
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

          {/* {markers.map((item, index) => {
            const position =
              total > 0 ? clamp((Number(item.at) / total) * 100, 0, 100) : 0;

            return (
              <button
                key={item.at ?? index}
                type="button"
                title={item.label || "Chapter"}
                aria-label={`Seek to ${item.label || "chapter"}`}
                disabled={seekDisabled}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  seekTo(Number(item.at) || 0);
                }}
                className="absolute top-1/2 z-30 h-3 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-slate-400 hover:bg-white disabled:cursor-not-allowed"
                style={{ left: `${position}%` }}
              />
            );
          })} */}
        </div>

        {/* Controls */}
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