import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Circle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Logo } from "@/components/common/Logo";
import { CandidateTile, InterviewerTile } from "./Tiles";
import { SpeakingDots } from "./AiAvatar";
import { ReadyCheck } from "../interviews/Ready";
import { interviewsService } from "@/services";
import { cn } from "@/lib/utils";

const MODEL = process.env.REACT_APP_GEMINI_LIVE_MODEL;
const INTERVIEW_DURATION = 8 * 60;


async function putWithRetry(url, blob, attempts = 4) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, { method: "PUT", body: blob });

      if (response.ok) return response;

      const details = await response.text().catch(() => "");

      lastError = new Error(`Upload failed: ${response.status} ${details}`);

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw lastError;
      }
    } catch (err) {
      lastError = err;

      if (err?.message?.startsWith("Upload failed: 4") && !err.message.startsWith("Upload failed: 429")) {
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
  }

  throw lastError;
}

function pickRecordingMimeType() {
  if (typeof window === "undefined" || !window.MediaRecorder) return null;

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
  ];

  if (typeof MediaRecorder.isTypeSupported !== "function") return "";

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function InterviewRoom({
  id,
  interview,
  isPublic = false,
}) {
  const [stage, setStage] = useState("ready");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [caption, setCaption] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const sessionRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const micSourceRef = useRef(null);
  const silentGainRef = useRef(null);
  const audioSourcesRef = useRef([]);
  const recordingSourcesRef = useRef([]);
  const nextPlayTimeRef = useRef(0);

  const recordingStreamRef = useRef(null);
  const recordingAudioContextRef = useRef(null);
  const recordingDestinationRef = useRef(null);
  const recordingMicSourceRef = useRef(null);
  const recordingScreenAudioSourceRef = useRef(null);
  const recordingModeRef = useRef("camera_only");

  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const startedAtRef = useRef(null);
  const endingRef = useRef(false);

  const candidateSpeakingRef = useRef(false);
  const silenceFramesRef = useRef(0);

  const pendingQuestionRef = useRef("");
  const pendingMetaRef = useRef(null);
  const questionMetaRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const captionBufferRef = useRef("");
  const captionTurnDoneRef = useRef(false);
  const questionRef = useRef("");
  const answerRef = useRef("");
  const segmentRef = useRef("");
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const uploadIdRef = useRef(null);
  const recordingKeyRef = useRef(null);
  const nextPartNumberRef = useRef(1);
  const presignedUrlsRef = useRef(new Map());
  const completedPartsRef = useRef([]);
  const recordingErrorRef = useRef(null);
  const blobProcessingPromiseRef = useRef(Promise.resolve());
  const recordingStartedRef = useRef(false);
  const recordingFinalizedRef = useRef(false);
  const recordingStopPromiseRef = useRef(null);
  const uploadQueueRef = useRef(Promise.resolve());

  const PART_SIZE = 5 * 1024 * 1024;
  const URL_BATCH_SIZE = 10;

  const interviewTitle = interview?.title || "Interview";
  const candidateName = interview?.candidate?.name || "Candidate";
  const company = interview?.compName || "Company";
  const interviewId = interview?.id;
  const organizationId = interview?.tenantId;

  const progress = Math.min(
    100,
    (elapsed / INTERVIEW_DURATION) * 100
  );

  const formatClock = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  const attachStream = useCallback((mediaStream) => {
    streamRef.current = mediaStream;
    setStream(mediaStream);
  }, []);

  const saveExchange = async (question, answer, meta) => {
    if (!question) return;

    try {
      await interviewsService.saveExchange({
        interviewId,
        slug: id,
        aiMsg: question,
        userMsg: answer,
        askedAt: meta?.askedAt ?? null,
        askedAtMs: meta?.askedAtMs ?? null,
        segmentId: meta?.segmentId ?? null,
        organizationId,
        isPublic,
      });
    } catch (err) {
      console.error("[Interview] Failed to save exchange:", err);
    }
  };

  const urlRequestRef = useRef(null);

  const fetchPresignedUrls = async () => {
    if (urlRequestRef.current) return urlRequestRef.current;

    const request = (async () => {
      const result = await interviewsService.getInterviewVideoUrls(
        interviewId,
        uploadIdRef.current,
        segmentRef.current
      );

      const response = result?.data ?? result;
      const urls = response?.urls ?? [];

      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error("The server returned no upload URLs.");
      }

      for (const { partNumber, url } of urls) {
        if (!Number.isInteger(partNumber) || !url) {
          throw new Error("Invalid presigned URL response.");
        }
        presignedUrlsRef.current.set(partNumber, url);
      }

      const startPart = Number.isInteger(response?.startPart)
        ? response.startPart
        : Math.min(...urls.map((u) => u.partNumber));

      console.log("Presigned URLs received:", {
        serverStartPart: startPart,
        actualParts: urls.map((u) => u.partNumber),
      });

      return { startPart };
    })();

    urlRequestRef.current = request;

    try {
      return await request;
    } finally {
      if (urlRequestRef.current === request) {
        urlRequestRef.current = null;
      }
    }
  };

  const ensurePresignedUrls = async (partNumber) => {
    if (presignedUrlsRef.current.has(partNumber)) return;

    for (let attempt = 0; attempt < 2; attempt++) {
      await fetchPresignedUrls();
      if (presignedUrlsRef.current.has(partNumber)) return;
    }

    throw new Error(
      `No presigned URL available for part ${partNumber}.`
    );
  };

  const replenishUrlsIfNeeded = () => {
    const next = nextPartNumberRef.current;

    const remaining = [...presignedUrlsRef.current.keys()].filter(
      (partNumber) => partNumber >= next
    ).length;

    if (remaining > URL_BATCH_SIZE / 2) return;

    fetchPresignedUrls().catch((err) => {
      recordingErrorRef.current = err;
      console.error("[Recording] URL refresh failed:", err);
    });
  };

  const uploadRecordingPart = (blob) => {
    const uploadTask = uploadQueueRef.current.then(async () => {
      if (!blob?.size) return;

      if (!uploadIdRef.current || !recordingKeyRef.current) {
        throw new Error("Multipart upload is no longer active.");
      }

      const partNumber = nextPartNumberRef.current;

      await ensurePresignedUrls(partNumber);

      const url = presignedUrlsRef.current.get(partNumber);

      if (!url) {
        throw new Error(
          `No presigned URL available for part ${partNumber}.`
        );
      }

      let response;

      try {
        response = await putWithRetry(url, blob);
      } catch (err) {
        throw new Error(`Part ${partNumber} upload failed: ${err?.message || err}`);
      }

      const etag = response.headers.get("ETag");

      if (!etag) {
        throw new Error(
          "ETag is missing. Check the storage bucket CORS policy."
        );
      }

      completedPartsRef.current.push({
        partNumber,
        etag,
      });

      presignedUrlsRef.current.delete(partNumber);
      nextPartNumberRef.current = partNumber + 1;

      replenishUrlsIfNeeded();
    });

    uploadQueueRef.current = uploadTask.catch(() => { });

    return uploadTask;
  };

  const recordingBlobType = () =>
    recorderRef.current?.mimeType || "video/webm";

  const processRecordingBlob = async (blob) => {
    if (!blob?.size) return;

    recordingChunksRef.current.push(blob);

    let totalSize = recordingChunksRef.current.reduce(
      (total, chunk) => total + chunk.size,
      0
    );

    while (totalSize >= PART_SIZE) {
      const combinedBlob = new Blob(recordingChunksRef.current, {
        type: recordingBlobType(),
      });

      const partBlob = combinedBlob.slice(0, PART_SIZE);
      const remainder = combinedBlob.slice(PART_SIZE);

      recordingChunksRef.current = remainder.size ? [remainder] : [];

      totalSize = remainder.size;

      await uploadRecordingPart(partBlob);
    }
  };

  const flushRemainingRecording = async () => {
    if (!recordingChunksRef.current.length) return;

    const finalBlob = new Blob(recordingChunksRef.current, {
      type: recordingBlobType(),
    });

    recordingChunksRef.current = [];

    if (finalBlob.size > 0) {
      await uploadRecordingPart(finalBlob);
    }
  };

  const startRecording = async (recordingStream) => {
    if (
      !recordingStream?.getVideoTracks().some(
        (track) => track.readyState === "live"
      )
    ) {
      throw new Error(
        recordingModeRef.current === "screen_and_camera"
          ? "Screen sharing video is unavailable."
          : "Camera video is unavailable."
      );
    }

    if (
      !recordingStream?.getAudioTracks().some(
        (track) => track.readyState === "live"
      )
    ) {
      throw new Error("Recording audio is unavailable.");
    }

    if (!window.MediaRecorder) {
      throw new Error("Recording is not supported in this browser.");
    }

    const mimeType = pickRecordingMimeType();

    const result = await interviewsService.startInterviewUpload(
      interviewId,
      segmentRef.current
    );
    const response = result?.data ?? result;
    const uploadId = response?.uploadId;

    if (!uploadId) {
      throw new Error("Failed to initialize the video upload.");
    }

    uploadIdRef.current = uploadId;
    recordingKeyRef.current = interviewId;

    completedPartsRef.current = [];
    recordingChunksRef.current = [];
    recordingErrorRef.current = null;
    blobProcessingPromiseRef.current = Promise.resolve();
    recordingStartedRef.current = false;
    recordingFinalizedRef.current = false;
    recordingStopPromiseRef.current = null;
    uploadQueueRef.current = Promise.resolve();

    presignedUrlsRef.current.clear();
    urlRequestRef.current = null;

    const first = await fetchPresignedUrls();
    nextPartNumberRef.current = first.startPart;

    const recorder = mimeType
      ? new MediaRecorder(recordingStream, { mimeType })
      : new MediaRecorder(recordingStream);

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (!event.data?.size) return;

      blobProcessingPromiseRef.current = blobProcessingPromiseRef.current
        .then(async () => {
          if (recordingErrorRef.current) return;
          await processRecordingBlob(event.data);
        })
        .catch((err) => {
          recordingErrorRef.current = err;
          console.error("[Recording] Blob processing failed:", err);
          setError(`Recording stopped unexpectedly: ${err?.message || err}`);
        });
    };

    recorder.onstop = () => {
      console.log("[Recording] MediaRecorder stopped.");
    };

    recorder.onerror = (event) => {
      recordingErrorRef.current =
        event.error || new Error("Recording failed.");

      console.error("[Recording] Recorder error:", event);
      setError(
        `Recording stopped unexpectedly: ${recordingErrorRef.current?.message || "recorder error"}`
      );
    };

    recorder.start(5000);
    recordingStartedAtRef.current = Date.now();
    recordingStartedRef.current = true;

    recordingStream.getVideoTracks()[0].addEventListener(
      "ended",
      () => {
        if (recorder.state !== "inactive") {
          try {
            recorder.stop();
          } catch { }
        }
      },
      { once: true }
    );
  };

  const stopScreenRecording = async () => {
    if (recordingStopPromiseRef.current) {
      return recordingStopPromiseRef.current;
    }

    if (recordingFinalizedRef.current) return;

    const stopPromise = (async () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        await new Promise((resolve, reject) => {
          const handleStop = () => {
            cleanup();
            resolve();
          };

          const handleError = (event) => {
            cleanup();
            reject(
              event.error ||
              new Error("MediaRecorder failed to stop.")
            );
          };

          const cleanup = () => {
            recorder.removeEventListener("stop", handleStop);
            recorder.removeEventListener("error", handleError);
          };

          recorder.addEventListener("stop", handleStop, {
            once: true,
          });

          recorder.addEventListener("error", handleError, {
            once: true,
          });

          try {
            recorder.stop();
          } catch (err) {
            cleanup();
            reject(err);
          }
        });
      }

      await blobProcessingPromiseRef.current;

      const recordingError = recordingErrorRef.current;

      await uploadQueueRef.current;

      try {
        await flushRemainingRecording();
      } catch (flushError) {
        console.error("[Recording] Final flush failed:", flushError);
      }

      await uploadQueueRef.current;

      if (!uploadIdRef.current) {
        recordingStartedRef.current = false;
        recorderRef.current = null;
        return;
      }

      const parts = [...completedPartsRef.current].sort(
        (a, b) => a.partNumber - b.partNumber
      );

      if (parts.length === 0) {
        throw (
          recordingError ||
          new Error("The recording contains no uploaded parts.")
        );
      }

      const result =
        await interviewsService.InterviewVideoComplete(
          segmentRef.current,
          uploadIdRef.current
        );

      const response = result?.data ?? result;

      if (result?.success === false || response?.success === false) {
        throw new Error(
          response?.message ||
          result?.message ||
          "Multipart upload completion failed."
        );
      }

      recordingFinalizedRef.current = true;
      recordingStartedRef.current = false;

      uploadIdRef.current = null;
      recordingKeyRef.current = null;

      recorderRef.current = null;
      recordingChunksRef.current = [];

      completedPartsRef.current = [];
      presignedUrlsRef.current.clear();
      urlRequestRef.current = null;
      nextPartNumberRef.current = 1;

      recordingStreamRef.current = null;

      console.log("[Recording] Upload completed:", response);
    })();

    recordingStopPromiseRef.current = stopPromise;

    try {
      await stopPromise;
    } catch (err) {
      recordingStopPromiseRef.current = null;
      throw err;
    }
  };

  useEffect(() => {
    if (stage !== "live") return;

    const timer = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsed(
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "live") return;

    let lock = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (
          "wakeLock" in navigator &&
          document.visibilityState === "visible"
        ) {
          const next = await navigator.wakeLock.request("screen");

          if (cancelled) {
            next.release().catch(() => { });
            return;
          }

          lock = next;
        }
      } catch { }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => { });
    };
  }, [stage]);

  const stopQueuedAudio = useCallback(() => {
    for (const recordingSource of recordingSourcesRef.current) {
      recordingSource.onended = null;

      try {
        recordingSource.stop();
      } catch { }

      try {
        recordingSource.disconnect();
      } catch { }
    }

    recordingSourcesRef.current = [];

    const sources = [...audioSourcesRef.current];

    audioSourcesRef.current = [];
    nextPlayTimeRef.current = 0;

    for (const source of sources) {
      source.onended = null;

      try {
        source.stop();
      } catch { }

      try {
        source.disconnect();
      } catch { }
    }

    setAiSpeaking(false);
  }, []);

  const stopAudioPipeline = useCallback(async () => {
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;

      try {
        processorRef.current.disconnect();
      } catch { }
    }

    try {
      micSourceRef.current?.disconnect();
    } catch { }

    try {
      silentGainRef.current?.disconnect();
    } catch { }

    const sources = [...audioSourcesRef.current];

    audioSourcesRef.current = [];
    nextPlayTimeRef.current = 0;

    for (const source of sources) {
      source.onended = null;

      try {
        source.stop();
      } catch { }

      try {
        source.disconnect();
      } catch { }
    }

    try {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        await audioContextRef.current.close();
      }
    } catch (err) {
      console.warn("[Gemini Live] Audio cleanup failed:", err);
    }

    processorRef.current = null;
    micSourceRef.current = null;
    silentGainRef.current = null;
    audioContextRef.current = null;
  }, []);

  const stopRecordingAudioPipeline = useCallback(async () => {
    try {
      recordingMicSourceRef.current?.disconnect();
    } catch { }

    try {
      recordingScreenAudioSourceRef.current?.disconnect();
    } catch { }

    try {
      if (
        recordingAudioContextRef.current &&
        recordingAudioContextRef.current.state !== "closed"
      ) {
        await recordingAudioContextRef.current.close();
      }
    } catch (err) {
      console.warn("[Recording] Audio cleanup failed:", err);
    }

    recordingMicSourceRef.current = null;
    recordingScreenAudioSourceRef.current = null;
    recordingDestinationRef.current = null;
    recordingAudioContextRef.current = null;
    recordingStreamRef.current = null;
  }, []);

  const endInterview = useCallback(async () => {
    if (endingRef.current) return;

    endingRef.current = true;

    const lastQuestion = pendingQuestionRef.current;
    const lastMeta = pendingMetaRef.current;
    const lastAnswer = answerRef.current.trim();

    pendingQuestionRef.current = "";
    pendingMetaRef.current = null;
    questionRef.current = "";
    answerRef.current = "";

    if (lastQuestion) {
      await saveExchange(lastQuestion, lastAnswer, lastMeta);
    }

    try {
      if (recordingStartedRef.current || uploadIdRef.current) {
        await stopScreenRecording();
      }
    } catch (err) {
      console.error("[Recording] Finalization failed:", err);

      setError(
        "The interview ended, but the recording could not be finalized."
      );
    }

    const session = sessionRef.current;
    sessionRef.current = null;

    try {
      session?.close();
    } catch (err) {
      console.warn("[Gemini Live] Session close failed:", err);
    }

    await stopAudioPipeline();
    await stopRecordingAudioPipeline();

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    screenStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    screenStreamRef.current = null;
    startedAtRef.current = null;

    candidateSpeakingRef.current = false;
    silenceFramesRef.current = 0;

    setStream(null);
    setAnswering(false);
    setAiSpeaking(false);
    setStage("ended");
  }, [stopAudioPipeline, stopRecordingAudioPipeline]);

  const handlesessionResumptionUpdate = async (update, interviewId) => {
    await interviewsService.sessionResumptionUpdate(update, interviewId);
  };

  useEffect(() => {
    return () => {
      endingRef.current = true;

      try {
        sessionRef.current?.close();
      } catch { }

      sessionRef.current = null;

      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch { }
      }

      if (processorRef.current) {
        processorRef.current.onaudioprocess = null;

        try {
          processorRef.current.disconnect();
        } catch { }
      }

      try {
        micSourceRef.current?.disconnect();
      } catch { }

      try {
        silentGainRef.current?.disconnect();
      } catch { }

      try {
        recordingMicSourceRef.current?.disconnect();
      } catch { }

      try {
        recordingScreenAudioSourceRef.current?.disconnect();
      } catch { }

      for (const source of audioSourcesRef.current) {
        source.onended = null;

        try {
          source.stop();
        } catch { }

        try {
          source.disconnect();
        } catch { }
      }

      audioSourcesRef.current = [];

      try {
        audioContextRef.current?.close();
      } catch { }

      try {
        recordingAudioContextRef.current?.close();
      } catch { }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      screenStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  const startInterview = async (
    mediaStream,
    sharedScreenStream = null,
    options = {}
  ) => {
    setStarting(true);
    setError("");
    setAnswering(false);
    setAiSpeaking(false);
    setCaption("");
    captionBufferRef.current = "";
    captionTurnDoneRef.current = false;
    pendingQuestionRef.current = "";
    pendingMetaRef.current = null;
    questionMetaRef.current = null;
    questionRef.current = "";
    answerRef.current = "";
    setElapsed(0);

    endingRef.current = false;
    candidateSpeakingRef.current = false;
    silenceFramesRef.current = 0;
    startedAtRef.current = null;

    let session = null;

    try {
      if (!MODEL) {
        throw new Error(
          "Gemini Live model is not configured. Set REACT_APP_GEMINI_LIVE_MODEL."
        );
      }

      if (
        !mediaStream ||
        !mediaStream
          .getAudioTracks()
          .some((track) => track.readyState === "live")
      ) {
        throw new Error("An active microphone is required.");
      }

      if (
        !mediaStream
          .getVideoTracks()
          .some((track) => track.readyState === "live")
      ) {
        throw new Error("An active camera is required.");
      }

      const screenVideoLive =
        !!sharedScreenStream &&
        sharedScreenStream
          .getVideoTracks()
          .some((track) => track.readyState === "live");

      const useScreen = screenVideoLive;

      recordingModeRef.current = useScreen
        ? "screen_and_camera"
        : "camera_only";

      attachStream(mediaStream);

      screenStreamRef.current = useScreen ? sharedScreenStream : null;

      let audioContext = audioContextRef.current;

      if (!audioContext || audioContext.state === "closed") {
        try {
          audioContext = new AudioContext({ sampleRate: 24000 });
        } catch {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          audioContext = new Ctx();
        }

        audioContextRef.current = audioContext;
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume().catch(() => { });
      }

      const RecCtx = window.AudioContext || window.webkitAudioContext;
      const recordingAudioContext = new RecCtx();

      await recordingAudioContext.resume().catch(() => { });

      const recordingDestination =
        recordingAudioContext.createMediaStreamDestination();

      const recordingMicSource =
        recordingAudioContext.createMediaStreamSource(
          new MediaStream(mediaStream.getAudioTracks())
        );

      recordingMicSource.connect(recordingDestination);

      recordingAudioContextRef.current = recordingAudioContext;
      recordingDestinationRef.current = recordingDestination;
      recordingMicSourceRef.current = recordingMicSource;

      const recordingVideoTracks = useScreen
        ? sharedScreenStream.getVideoTracks()
        : mediaStream
          .getVideoTracks()
          .filter((track) => track.readyState === "live")
          .slice(0, 1);

      const combinedRecordingStream = new MediaStream([
        ...recordingVideoTracks,
        ...recordingDestination.stream.getAudioTracks(),
      ]);

      recordingStreamRef.current = combinedRecordingStream;

      const result = await interviewsService.getLiveSession(id, isPublic);
      const token = result?.token ?? result?.data?.token;

      const serverElapsed = Number(
        result?.elapsedSeconds ?? result?.data?.elapsedSeconds ?? 0
      );
      const initialElapsed =
        Number.isFinite(serverElapsed) && serverElapsed > 0
          ? Math.floor(serverElapsed)
          : 0;

      const interviewStartedAt = Date.now() - initialElapsed * 1000;
      const sessionResumptionHandle =
        result?.sessionResumptionHandle ??
        result?.data?.sessionResumptionHandle;
      segmentRef.current = result?.segmentId ?? result?.data?.segmentId;

      if (!token || typeof token !== "string") {
        throw new Error("Failed to get Gemini Live session token.");
      }

      await startRecording(combinedRecordingStream);

      if (endingRef.current) return;

      if (audioContext.state === "suspended") {
        await audioContext.resume().catch(() => { });
      }

      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: {
          apiVersion: "v1alpha",
        },
      });

      const config = {
        ...(sessionResumptionHandle
          ? {
            sessionResumption: {
              handle: sessionResumptionHandle,
            },
          }
          : {}),
      };

      session = await ai.live.connect({
        model: MODEL,
        config,
        callbacks: {
          onopen: () => {
            if (endingRef.current) return;

            console.log("[Gemini Live] Connected");

            startedAtRef.current = interviewStartedAt;
            setElapsed(initialElapsed);
            setStage("live");
            setStarting(false);
          },

          onmessage: async (message) => {
            if (endingRef.current) return;

            if (message.sessionResumptionUpdate) {
              const update = message.sessionResumptionUpdate;
              handlesessionResumptionUpdate(update, interviewId);
            }

            const content = message.serverContent;

            if (!content) return;

            const inputText = content.inputTranscription?.text;

            if (inputText) {
              answerRef.current += inputText;
            }

            const outputText = content.outputTranscription?.text;

            if (outputText) {
              if (!questionMetaRef.current) {
                const now = Date.now();

                questionMetaRef.current = {
                  askedAt: new Date(now).toISOString(),
                  askedAtMs: Math.max(0, now - recordingStartedAtRef.current),
                  segmentId: segmentRef.current || null,
                };
              }

              if (captionTurnDoneRef.current) {
                captionBufferRef.current = "";
                captionTurnDoneRef.current = false;
              }

              captionBufferRef.current += outputText;
              setCaption(captionBufferRef.current);
              questionRef.current += outputText;
            }

            if (content.interrupted) {
              captionTurnDoneRef.current = true;
              stopQueuedAudio();
            }

            const parts = content.modelTurn?.parts ?? [];

            for (const part of parts) {
              if (endingRef.current) return;

              const inlineData = part.inlineData;

              if (!inlineData?.data) continue;

              const mimeType = inlineData.mimeType ?? "";

              if (!mimeType.startsWith("audio/")) continue;

              try {
                const context = audioContextRef.current;

                if (!context || context.state === "closed") {
                  continue;
                }

                if (context.state === "suspended") {
                  await context.resume();
                }

                const binary = atob(inlineData.data);
                const bytes = new Uint8Array(binary.length);

                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }

                const rateMatch = mimeType.match(/rate=(\d+)/i);

                const sampleRate = rateMatch
                  ? Number(rateMatch[1])
                  : 24000;

                if (
                  !Number.isFinite(sampleRate) ||
                  sampleRate <= 0 ||
                  bytes.byteLength === 0 ||
                  bytes.byteLength % 2 !== 0
                ) {
                  continue;
                }

                const alignedBuffer = bytes.buffer.slice(
                  bytes.byteOffset,
                  bytes.byteOffset + bytes.byteLength
                );

                const samples = new Int16Array(alignedBuffer);

                const audioBuffer = context.createBuffer(
                  1,
                  samples.length,
                  sampleRate
                );

                const channel = audioBuffer.getChannelData(0);

                for (let i = 0; i < samples.length; i++) {
                  channel[i] = samples[i] / 32768;
                }

                const source = context.createBufferSource();

                source.buffer = audioBuffer;
                source.connect(context.destination);

                const now = context.currentTime;

                if (nextPlayTimeRef.current < now) {
                  nextPlayTimeRef.current = now;
                }

                const startTime = nextPlayTimeRef.current;

                source.start(startTime);

                nextPlayTimeRef.current += audioBuffer.duration;

                audioSourcesRef.current.push(source);

                const recordingContext = recordingAudioContextRef.current;
                const recDestination = recordingDestinationRef.current;

                if (
                  recordingContext &&
                  recordingContext.state !== "closed" &&
                  recDestination
                ) {
                  const recordingBuffer = recordingContext.createBuffer(
                    1,
                    samples.length,
                    sampleRate
                  );

                  recordingBuffer.getChannelData(0).set(channel);

                  const recordingSource =
                    recordingContext.createBufferSource();

                  recordingSource.buffer = recordingBuffer;
                  recordingSource.connect(recDestination);

                  const recordingStartTime = Math.max(
                    recordingContext.currentTime,
                    recordingContext.currentTime +
                    (startTime - context.currentTime)
                  );

                  recordingSource.start(recordingStartTime);

                  recordingSourcesRef.current.push(recordingSource);

                  recordingSource.onended = () => {
                    recordingSourcesRef.current =
                      recordingSourcesRef.current.filter(
                        (item) => item !== recordingSource
                      );

                    try {
                      recordingSource.disconnect();
                    } catch { }
                  };
                }

                setAiSpeaking(true);

                source.onended = () => {
                  audioSourcesRef.current =
                    audioSourcesRef.current.filter(
                      (item) => item !== source
                    );

                  try {
                    source.disconnect();
                  } catch { }

                  const currentContext = audioContextRef.current;

                  if (
                    audioSourcesRef.current.length === 0 &&
                    currentContext &&
                    currentContext.state !== "closed" &&
                    nextPlayTimeRef.current <=
                    currentContext.currentTime + 0.05
                  ) {
                    setAiSpeaking(false);
                  }
                };
              } catch (audioError) {
                console.error(
                  "[Gemini Live] Audio playback failed:",
                  audioError
                );
              }
            }

            if (content.turnComplete) {
              captionTurnDoneRef.current = true;

              const completedQuestion = questionRef.current.trim();
              const answer = answerRef.current.trim();

              questionRef.current = "";
              answerRef.current = "";

              if (completedQuestion) {
                const previousQuestion = pendingQuestionRef.current;
                const previousMeta = pendingMetaRef.current;

                pendingQuestionRef.current = completedQuestion;
                pendingMetaRef.current = questionMetaRef.current;
                questionMetaRef.current = null;

                if (previousQuestion) {
                  await saveExchange(previousQuestion, answer, previousMeta);
                }
              }
            }
          },

          onerror: (event) => {
            console.error("[Gemini Live] Connection error:", event);

            if (!endingRef.current) {
              setError("The live interview encountered an error.");
            }
          },

          onclose: (event) => {
            console.warn("[Gemini Live] Connection closed:", {
              code: event?.code,
              reason: event?.reason,
              wasClean: event?.wasClean,
            });

            stopQueuedAudio();

            candidateSpeakingRef.current = false;
            silenceFramesRef.current = 0;

            setAnswering(false);
            setAiSpeaking(false);

            if (!endingRef.current) {
              setError("The Gemini Live connection was closed.");

              endInterview();
            }
          },
        },
      });

      if (endingRef.current) {
        session.close();
        return;
      }

      sessionRef.current = session;

      await startMicrophoneStreaming(mediaStream, audioContext, session);

      if (endingRef.current) return;

      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "I am ready. Begin the interview now.",
              },
            ],
          },
        ],
        turnComplete: true,
      });

      console.log("[Gemini Live] Initial prompt sent", {
        recordingMode: recordingModeRef.current,
        requestedMode: options?.recordingMode,
      });
    } catch (err) {
      console.error("[Interview] Failed to start:", err);

      endingRef.current = true;

      try {
        session?.close();
      } catch { }

      if (sessionRef.current === session) {
        sessionRef.current = null;
      }

      try {
        if (recordingStartedRef.current || uploadIdRef.current) {
          await stopScreenRecording();
        }
      } catch (recordingError) {
        console.error(
          "[Recording] Finalization after startup failure failed:",
          recordingError
        );
      }

      await stopAudioPipeline();
      await stopRecordingAudioPipeline();

      mediaStream?.getTracks().forEach((track) => {
        track.stop();
      });

      sharedScreenStream?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
      screenStreamRef.current = null;
      startedAtRef.current = null;

      setStream(null);
      setAnswering(false);
      setAiSpeaking(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to start the interview."
      );

      setStage("ready");
    } finally {
      setStarting(false);
    }
  };

  async function startMicrophoneStreaming(
    mediaStream,
    audioContext,
    session
  ) {
    if (!mediaStream.getAudioTracks().length) {
      throw new Error("No microphone track is available.");
    }

    const source = audioContext.createMediaStreamSource(
      new MediaStream(mediaStream.getAudioTracks())
    );

    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    const silentGain = audioContext.createGain();

    silentGain.gain.value = 0;

    micSourceRef.current = source;
    processorRef.current = processor;
    silentGainRef.current = silentGain;

    const SPEECH_THRESHOLD = 0.025;
    const SILENCE_THRESHOLD = 0.012;
    const SILENCE_FRAMES_TO_STOP = 8;

    processor.onaudioprocess = (event) => {
      if (
        endingRef.current ||
        !sessionRef.current ||
        sessionRef.current !== session
      ) {
        return;
      }

      const input = event.inputBuffer.getChannelData(0);

      let sumSquares = 0;

      for (let i = 0; i < input.length; i++) {
        sumSquares += input[i] * input[i];
      }

      const rms = Math.sqrt(sumSquares / input.length);

      if (rms >= SPEECH_THRESHOLD) {
        silenceFramesRef.current = 0;

        if (!candidateSpeakingRef.current) {
          candidateSpeakingRef.current = true;
          setAnswering(true);
        }
      } else if (rms < SILENCE_THRESHOLD) {
        silenceFramesRef.current += 1;

        if (
          candidateSpeakingRef.current &&
          silenceFramesRef.current >= SILENCE_FRAMES_TO_STOP
        ) {
          candidateSpeakingRef.current = false;
          silenceFramesRef.current = 0;
          setAnswering(false);
        }
      }

      const pcm16 = floatTo16BitPcm(
        resample(input, audioContext.sampleRate, 16000)
      );

      if (!pcm16.length) return;

      try {
        session.sendRealtimeInput({
          audio: {
            data: arrayBufferToBase64(pcm16.buffer),
            mimeType: "audio/pcm;rate=16000",
          },
        });
      } catch (err) {
        console.error("[Gemini Live] Microphone send failed:", err);
      }
    };

    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);
  }

  const toggleMic = () => {
    const next = !micOn;

    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });

    setMicOn(next);

    if (!next) {
      candidateSpeakingRef.current = false;
      silenceFramesRef.current = 0;
      setAnswering(false);
    }
  };

  const toggleCamera = () => {
    const next = !camOn;

    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });

    if (streamRef.current) {
      setStream(new MediaStream(streamRef.current.getTracks()));
    }

    setCamOn(next);
  };

  if (stage === "ready") {
    return (
      <>
        <ReadyCheck
          starting={starting}
          onStart={(mediaStream, sharedScreenStream, options) =>
            startInterview(mediaStream, sharedScreenStream, options)
          }
        />

        {error && (
          <p
            role="alert"
            className="mx-auto max-w-2xl px-4 pb-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </>
    );
  }

  if (stage === "ended") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Interview ended</h1>

          <p className="mt-3 text-sm text-slate-600">
            Your interview session has been closed.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Duration: {formatClock(elapsed)}
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-slate-50"
      data-testid="interview-room"
    >
      <header className="z-20 shrink-0 border-b border-slate-200 bg-white">
        <div className="flex h-11 items-center gap-2 px-3 sm:h-12 sm:gap-3 sm:px-5">
          <Logo className="hidden sm:inline-flex" />

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold text-slate-900"
              data-testid="room-title"
            >
              {interviewTitle}
            </p>
            <p className="truncate text-xs text-slate-500">
              {company} · {candidateName}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] font-medium text-emerald-700"
              data-testid="room-live-status"
            >
              <Circle className="h-2 w-2 animate-pulse fill-current" />
              LIVE
            </span>

            <span
              className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs tabular-nums text-slate-700"
              data-testid="room-duration"
            >
              {formatClock(elapsed)}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 px-3 py-1 sm:px-5">
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Interview progress</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mx-3 mt-2 shrink-0 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 sm:mx-6"
        >
          {error}
        </div>
      )}

      <main className="mx-auto grid w-full max-w-[1500px] min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.4fr)_minmax(0,0.4fr)] gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,0.42fr)]">
        <CandidateTile
          key={camOn ? "cam-on" : "cam-off"}
          name={candidateName}
          micOn={micOn}
          camOn={camOn}
          stream={stream}
          answering={answering}
          className="h-full min-h-0"
        />

        <InterviewerTile
          interviewer="AI Interviewer"
          speaking={aiSpeaking}
          caption={captionsOn ? caption : null}
          avatarSize={220}
          stream={null}
          className="h-full min-h-0"
        />

        <section
          className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-5"
          data-testid="candidate-answer-card"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Interview status
            </p>

            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Session active
            </span>
          </div>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate-700 sm:text-sm">
            {!micOn ? (
              <span className="text-rose-600">
                Your microphone is muted. Unmute to answer.
              </span>
            ) : aiSpeaking ? (
              <>
                <SpeakingDots active className="text-blue-500" />
                The AI interviewer is speaking...
              </>
            ) : answering ? (
              <>
                <SpeakingDots active className="text-emerald-500" />
                Listening to your answer...
              </>
            ) : (
              "Listen to the interviewer and answer naturally."
            )}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Take your time. The AI interviewer may ask follow-up questions
            based on your responses.
          </p>
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white p-3 transition-colors sm:p-5",
            aiSpeaking ? "border-blue-200" : "border-slate-200",
            !captionsOn && "opacity-60"
          )}
          data-testid="current-question-card"
        >
          <div className="flex shrink-0 items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-700">
              <Sparkles className="h-3 w-3" />
              Live captions
            </p>

            <button
              type="button"
              onClick={() => setCaptionsOn((value) => !value)}
              className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-50"
              data-testid="toggle-captions-button"
            >
              {captionsOn ? "Hide captions" : "Show captions"}
            </button>
          </div>

          <div
            className={cn(
              "mt-2 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-900 sm:text-[15px]",
              aiSpeaking && "caret"
            )}
            data-testid="current-question-text"
            aria-live="polite"
          >
            {captionsOn
              ? caption || "Waiting for the interviewer..."
              : "Captions are hidden."}
          </div>
        </section>
      </main>

      <footer className="z-20 shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-[1500px] items-center justify-center gap-3 px-3 sm:h-14 sm:justify-between sm:px-5">
          <p className="hidden text-xs text-slate-500 sm:block">
            {micOn ? "Microphone on" : "Microphone off"} ·{" "}
            {camOn ? "Camera on" : "Camera off"}
          </p>

          <div className="flex items-center gap-2">
            <ControlButton
              active={micOn}
              onClick={toggleMic}
              label={micOn ? "Mute microphone" : "Unmute microphone"}
              icon={micOn ? Mic : MicOff}
            />

            <ControlButton
              active={camOn}
              onClick={toggleCamera}
              label={camOn ? "Turn camera off" : "Turn camera on"}
              icon={camOn ? Video : VideoOff}
            />

            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="ml-1 inline-flex h-9 items-center gap-2 rounded-full bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700 sm:h-10 sm:px-4 sm:text-sm"
              data-testid="end-interview-button"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">End interview</span>
            </button>
          </div>

          <p className="hidden w-[150px] text-right text-xs text-slate-400 sm:block">
            AI-guided interview
          </p>
        </div>
      </footer>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent data-testid="end-interview-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>End the interview now?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview? You will not be
              able to rejoin this session.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel data-testid="end-interview-cancel">
              Continue interview
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                setConfirm(false);
                endInterview();
              }}
              data-testid="end-interview-confirm"
            >
              End interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  label,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
        active
          ? "border-slate-200 bg-white hover:bg-slate-50"
          : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      )}
    >
      <Icon size={17} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function resample(input, fromRate, toRate) {
  if (fromRate === toRate) return input;

  const ratio = fromRate / toRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const index = Math.floor(i * ratio);
    const nextIndex = Math.min(index + 1, input.length - 1);

    const fraction = i * ratio - index;

    output[i] =
      input[index] * (1 - fraction) + input[nextIndex] * fraction;
  }

  return output;
}

function floatTo16BitPcm(input) {
  const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));

    output[i] = sample < 0 ? sample * 32768 : sample * 32767;
  }

  return output;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}
