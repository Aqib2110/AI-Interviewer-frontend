// function Progress({ index = 0, total = 0, skill = "General" }) {
//   return (
//     <div
//       className="flex items-center gap-4"
//       data-testid="interview-progress"
//     >
//       <span className="whitespace-nowrap text-[13px] font-medium text-slate-900">
//         Question {index + 1}{" "}
//         <span className="text-slate-400">of {total}</span>
//       </span>

//       <div className="flex flex-1 gap-1">
//         {Array.from({ length: total }).map((_, i) => (
//           <span
//             key={i}
//             className={cn(
//               "h-1.5 flex-1 rounded-full transition-colors",
//               i < index
//                 ? "bg-slate-900"
//                 : i === index
//                   ? "bg-blue-600"
//                   : "bg-slate-200"
//             )}
//           />
//         ))}
//       </div>

//       <span className="hidden whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 sm:inline">
//         {skill}
//       </span>
//     </div>
//   );
// }

// function CtlButton({
//   on = false,
//   onClick,
//   iconOn: On,
//   iconOff: Off,
//   label,
//   testId,
// }) {
//   return (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <button
//           onClick={onClick}
//           aria-label={label}
//           aria-pressed={on}
//           data-testid={testId}
//           className={cn(
//             "flex h-12 w-12 items-center justify-center rounded-full border transition-colors",
//             on
//               ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
//               : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
//           )}
//         >
//           {on ? (
//             <On className="h-5 w-5" />
//           ) : (
//             <Off className="h-5 w-5" />
//           )}
//         </button>
//       </TooltipTrigger>

//       <TooltipContent>{label}</TooltipContent>
//     </Tooltip>
//   );
// }

// function Ended({ interview, elapsed = 0, answered = 0 }) {
//   const { isAuthenticated } = useSession();

//   const steps = [
//     ["Recording saved", "done"],
//     ["Transcript processing", "active"],
//     ["AI evaluation against required skills", "queued"],
//     ["Skill scores & candidate report", "queued"],
//   ];

//   const candidateName =
//     interview?.candidate?.name?.trim()?.split(/\s+/)?.[0] || "Candidate";

//   const role = interview?.role || "scheduled";

//   return (
//     <div
//       className="flex min-h-screen flex-col bg-slate-50"
//       data-testid="interview-ended"
//     >
//       <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
//         <Logo />
//       </header>

//       <div className="flex flex-1 items-center justify-center p-6">
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8"
//         >
//           <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
//             <Check className="h-6 w-6" />
//           </span>

//           <h1 className="mt-5 text-2xl font-semibold text-slate-950">
//             Interview submitted
//           </h1>

//           <p className="mt-2 text-sm text-slate-500">
//             Thanks, {candidateName}. Your {role} interview has ended and is
//             being evaluated.
//           </p>

//           <div className="mt-6 grid grid-cols-2 gap-3">
//             <div className="rounded-lg bg-slate-50 p-3">
//               <p className="text-xs text-slate-500">Duration</p>
//               <p
//                 className="font-mono text-lg font-semibold text-slate-900"
//                 data-testid="ended-duration"
//               >
//                 {formatClock(elapsed ?? 0)}
//               </p>
//             </div>

//             <div className="rounded-lg bg-slate-50 p-3">
//               <p className="text-xs text-slate-500">Questions answered</p>
//               <p className="font-mono text-lg font-semibold text-slate-900">
//                 {answered ?? 0}
//               </p>
//             </div>
//           </div>

//           <ul className="mt-6 space-y-3">
//             {steps.map(([step, status]) => (
//               <li
//                 key={step}
//                 className="flex items-center gap-3 text-sm"
//               >
//                 <span
//                   className={cn(
//                     "flex h-5 w-5 items-center justify-center rounded-full",
//                     status === "done"
//                       ? "bg-emerald-500 text-white"
//                       : status === "active"
//                         ? "bg-blue-50 text-blue-600"
//                         : "bg-slate-100 text-slate-400"
//                   )}
//                 >
//                   {status === "done" ? (
//                     <Check className="h-3 w-3" />
//                   ) : status === "active" ? (
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                   ) : (
//                     <Circle className="h-1.5 w-1.5 fill-current" />
//                   )}
//                 </span>

//                 <span
//                   className={
//                     status === "queued"
//                       ? "text-slate-400"
//                       : "text-slate-800"
//                   }
//                 >
//                   {step}
//                 </span>
//               </li>
//             ))}
//           </ul>

//           <Button
//             asChild
//             className="mt-8 w-full"
//             data-testid="ended-back-button"
//           >
//             <Link
//               to={
//                 isAuthenticated && interview?.id
//                   ? `/app/interviews/${interview.id}`
//                   : "/"
//               }
//             >
//               {isAuthenticated ? "Back to Intervia" : "Done"}
//             </Link>
//           </Button>
//         </motion.div>
//       </div>
//     </div>
//   );
// }











// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { toast } from "sonner";
// import {
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
//   Captions,
//   PhoneOff,
//   Circle,
//   Check,
//   Loader2,
//   Sparkles,
//   ShieldCheck,
// } from "lucide-react";
// import { useAsync } from "@/hooks/useAsync";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Volume2 } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Logo } from "@/components/common/Logo";
// import { CandidateTile, InterviewerTile } from "./Tiles";
// import { SpeakingDots } from "./AiAvatar";
// import { useInterviewSimulation } from "./useInterviewSimulation";
// import { useMediaQuery } from "@/hooks/useAsync";
// import { useSession } from "@/context/SessionContext";
// import { formatClock } from "@/lib/format";
// import { interviewsService } from "@/services";
// import { cn } from "@/lib/utils";
// import { ReadyCheck } from "../interviews/Ready";
// import { useRef,useCallback,useEffect } from "react";
// import { GoogleGenAI } from "@google/genai";

// const MODEL = process.env.REACT_APP_GEMINI_LIVE_MODEL;

// export function InterviewRoom({
//   id,
//   interview,
//   isPublic = false,
// }) {
//   const [stage, setStage] = useState("ready");
//   const [starting, setStarting] = useState(false);
//   const [error, setError] = useState("");
//   const [stream, setStream] = useState(null);
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [answering, setanswering] = useState(false);
//   const [captionsOn, setCaptionsOn] = useState(true);
//   const [aiSpeaking, setAiSpeaking] = useState(false);
//   const [caption, setCaption] = useState("");
//   const [elapsed, setElapsed] = useState(0);
//   const [startedAt, setStartedAt] = useState(null);

//   const videoRef = useRef(null);
//   const sessionRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const processorRef = useRef(null);
//   const micSourceRef = useRef(null);
//   const silentGainRef = useRef(null);
//   const playbackSourcesRef = useRef(new Set());
//   const nextPlayTimeRef = useRef(0);
// const audioSourcesRef = useRef([]);
//   const streamRef = useRef(null);
//   const startedAtRef = useRef(null);
//   const endingRef = useRef(false);

//   const interviewTitle = interview?.title || "Interview";
//   const candidateName = interview?.candidate?.name || "Candidate";
//   const company = interview?.company || interview?.compName || "Company";

// const INTERVIEW_DURATION = 8 * 60;

// const progress = Math.min(
//   100,
//   (elapsed / INTERVIEW_DURATION) * 100
// );

//   const attachStream = useCallback((mediaStream) => {
//     streamRef.current = mediaStream;
//     setStream(mediaStream);

//     if (videoRef.current) {
//       videoRef.current.srcObject = mediaStream;
//     }
//   }, []);

//   useEffect(() => {
//     if (stage === "ready") return;

//     if (videoRef.current && streamRef.current) {
//       videoRef.current.srcObject = streamRef.current;
//     }
//   }, [stage, stream]);

//   useEffect(() => {
//     if (stage !== "live") return;

//     const timer = window.setInterval(() => {
//       if (startedAtRef.current) {
//         setElapsed(
//           Math.floor((Date.now() - startedAtRef.current) / 1000)
//         );
//       }
//     }, 1000);

//     return () => window.clearInterval(timer);
//   }, [stage]);

//   const stopAudioPipeline = useCallback(async () => {
//     processorRef.current?.disconnect();
//     micSourceRef.current?.disconnect();
//     silentGainRef.current?.disconnect();

//     playbackSourcesRef.current.forEach((source) => {
//       try {
//         source.stop();
//       } catch {}
//     });

//     playbackSourcesRef.current.clear();

//     try {
//       await audioContextRef.current?.close();
//     } catch (err) {
//       console.warn("Audio cleanup failed:", err);
//     }

//     processorRef.current = null;
//     micSourceRef.current = null;
//     silentGainRef.current = null;
//     audioContextRef.current = null;
//   }, []);

//   const endInterview = useCallback(async () => {
//     if (endingRef.current) return;

//     endingRef.current = true;

//     try {
//       sessionRef.current?.close();
//     } catch (err) {
//       console.warn("Gemini session close failed:", err);
//     }

//     sessionRef.current = null;

//     await stopAudioPipeline();

//     streamRef.current?.getTracks().forEach((track) => track.stop());

//     streamRef.current = null;
//     setStream(null);
//     setStage("ended");
//     setAiSpeaking(false);
//   }, [stopAudioPipeline]);

//   useEffect(() => {
//     return () => {
//       try {
//         sessionRef.current?.close();
//       } catch {}

//       processorRef.current?.disconnect();
//       micSourceRef.current?.disconnect();
//       silentGainRef.current?.disconnect();

//       playbackSourcesRef.current.forEach((source) => {
//         try {
//           source.stop();
//         } catch {}
//       });

//       audioContextRef.current?.close().catch(() => {});

//       streamRef.current?.getTracks().forEach((track) => track.stop());
//     };
//   }, []);

 

// const startInterview = async (mediaStream) => {
//   setStarting(true);
//   setError("");
//   endingRef.current = false;

//   let session = null;

//   const stopQueuedAudio = () => {
//     for (const source of audioSourcesRef.current) {
//       try {
//         source.stop();
//       } catch {
//         // The source may already have stopped.
//       }
//     }

//     audioSourcesRef.current = [];
//     nextPlayTimeRef.current = 0;
//   };

//   try {
//     const result = await interviewsService.getLiveSession(id, isPublic);
//     const token = result?.token ?? result?.data?.token;

//     if (!token || typeof token !== "string") {
//       throw new Error("Failed to get Gemini Live session token.");
//     }

//     attachStream(mediaStream);

//     let audioContext = audioContextRef.current;

//     if (!audioContext || audioContext.state === "closed") {
//       audioContext = new AudioContext({ sampleRate: 24000 });
//       audioContextRef.current = audioContext;
//     }

//     if (audioContext.state === "suspended") {
//       await audioContext.resume();
//     }

//     const ai = new GoogleGenAI({
//       apiKey: token,
//       httpOptions: {
//         apiVersion: "v1alpha",
//       },
//     });

//     session = await ai.live.connect({
//       model: MODEL,

//       callbacks: {
//         onopen: () => {
//           console.log("[Gemini Live] WebSocket connected successfully");
//           setStage("live");
//           setStarting(false);
//         },

        
// onmessage: async (message) => {
//   if (endingRef.current) {
//     return;
//   }

//   const serverContent = message.serverContent;

//   if (!serverContent) {
//     return;
//   }

//   const inputText = serverContent.inputTranscription?.text;
//   const outputText = serverContent.outputTranscription?.text;

//   if (inputText) {
//     setAnswering(true);

//     console.log("[Gemini Live] Candidate said:", inputText);

//     // Keep your existing candidate-caption state update here.
//   }

//   if (outputText) {
//     console.log("[Gemini Live] AI said:", outputText);

//     // Keep your existing AI-caption state update here.
//   }

//   if (serverContent.interrupted) {
//     console.log("[Gemini Live] AI response interrupted");

//     stopQueuedAudio();
//     setAiSpeaking(false);
//   }

//   const parts = serverContent.modelTurn?.parts ?? [];

//   for (const part of parts) {
//     const inlineData = part.inlineData;

//     if (!inlineData?.data) {
//       continue;
//     }

//     const mimeType = inlineData.mimeType ?? "";

//     if (!mimeType.startsWith("audio/")) {
//       continue;
//     }

//     try {
//       const context = audioContextRef.current;

//       if (!context || context.state === "closed") {
//         continue;
//       }

//       if (context.state === "suspended") {
//         await context.resume();
//       }

//       const binary = atob(inlineData.data);
//       const bytes = new Uint8Array(binary.length);

//       for (let i = 0; i < binary.length; i++) {
//         bytes[i] = binary.charCodeAt(i);
//       }

//       const rateMatch = mimeType.match(/rate=(\d+)/i);
//       const sampleRate = rateMatch
//         ? Number(rateMatch[1])
//         : 24000;

//       if (
//         !Number.isFinite(sampleRate) ||
//         sampleRate <= 0 ||
//         bytes.byteLength % 2 !== 0
//       ) {
//         console.error("[Gemini Live] Invalid PCM audio data");
//         continue;
//       }

//       const alignedBuffer = bytes.buffer.slice(
//         bytes.byteOffset,
//         bytes.byteOffset + bytes.byteLength
//       );

//       const samples = new Int16Array(alignedBuffer);

//       const audioBuffer = context.createBuffer(
//         1,
//         samples.length,
//         sampleRate
//       );

//       const channel = audioBuffer.getChannelData(0);

//       for (let i = 0; i < samples.length; i++) {
//         channel[i] = samples[i] / 32768;
//       }

//       const source = context.createBufferSource();

//       source.buffer = audioBuffer;
//       source.connect(context.destination);

//       const now = context.currentTime;

//       if (nextPlayTimeRef.current < now) {
//         nextPlayTimeRef.current = now;
//       }

//       const scheduledAt = nextPlayTimeRef.current;

//       source.start(scheduledAt);

//       nextPlayTimeRef.current += audioBuffer.duration;

//       audioSourcesRef.current.push(source);

//       setAiSpeaking(true);

//       source.onended = () => {
//         audioSourcesRef.current =
//           audioSourcesRef.current.filter(
//             (item) => item !== source
//           );

//         try {
//           source.disconnect();
//         } catch {
//           // Already disconnected.
//         }

//         // Only mark the AI as silent when all queued audio
//         // has finished playing.
//         if (
//           audioSourcesRef.current.length === 0 &&
//           audioContextRef.current &&
//           nextPlayTimeRef.current <=
//             audioContextRef.current.currentTime + 0.05
//         ) {
//           setAiSpeaking(false);
//         }
//       };
//     } catch (audioError) {
//       console.error(
//         "[Gemini Live] Audio playback failed:",
//         audioError
//       );
//     }
//   }

//   if (serverContent.turnComplete) {
//     console.log("[Gemini Live] Conversation turn completed");

//     // Gemini may have finished generating while audio is
//     // still playing, so don't reset aiSpeaking here.
//   }
// },


//         onerror: (event) => {
//           console.error("[Gemini Live] WebSocket error:", event);

//           setError("The live interview encountered an error.");
//         },

//         onclose: (event) => {
//           console.warn("[Gemini Live] WebSocket closed:", {
//             code: event?.code,
//             reason: event?.reason,
//             wasClean: event?.wasClean,
//           });

//           if (!endingRef.current) {
//             stopQueuedAudio();
//             setError("The Gemini Live connection was closed.");
//             setStage("ended");
//           }
//         },
//       },
//     });

//     if (endingRef.current) {
//       session.close();
//       return;
//     }

//     sessionRef.current = session;

//     // Start the microphone stream.
//     await startMicrophoneStreaming(
//       mediaStream,
//       audioContext,
//       session
//     );

//     if (endingRef.current) {
//       return;
//     }

//     console.log("[Gemini Live] Microphone streaming started");

//     // IMPORTANT:
//     // Explicitly ask Gemini to begin the interview.
//     // Do not wait for the candidate to speak first.
//     session.sendClientContent({
//       turns: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: [
//                 "I am ready,Begin with the interview now.",
//               ].join(" "),
//             },
//           ],
//         },
//       ],
//       turnComplete: true,
//     });

//     console.log("[Gemini Live] Initial interview prompt sent");
//   } catch (error) {
//     console.error("[Gemini Live] Failed to start interview:", error);

//     endingRef.current = true;
//     sessionRef.current = null;

//     stopQueuedAudio();

//     if (session) {
//       try {
//         session.close();
//       } catch (closeError) {
//         console.error(
//           "[Gemini Live] Failed to close session:",
//           closeError
//         );
//       }
//     }

//     setError(
//       error instanceof Error
//         ? error.message
//         : "Failed to start the interview."
//     );

//     setStage("ready");
//   } finally {
//     setStarting(false);
//   }
// };



//   async function startMicrophoneStreaming(
//     mediaStream,
//     audioContext,
//     session
//   ) {
//     if (!mediaStream.getAudioTracks().length) {
//       throw new Error("No microphone track is available.");
//     }

//     const source = audioContext.createMediaStreamSource(mediaStream);
//     const processor = audioContext.createScriptProcessor(4096, 1, 1);
//     const silentGain = audioContext.createGain();

//     silentGain.gain.value = 0;

//     micSourceRef.current = source;
//     processorRef.current = processor;
//     silentGainRef.current = silentGain;

//     processor.onaudioprocess = (event) => {
//       if (
//         !sessionRef.current ||
//         sessionRef.current !== session
//       ) {
//         return;
//       }

//       const input = event.inputBuffer.getChannelData(0);

//       const pcm16 = floatTo16BitPcm(
//         resample(input, audioContext.sampleRate, 16000)
//       );

//       if (!pcm16.length) return;

//       session.sendRealtimeInput({
//         audio: {
//           data: arrayBufferToBase64(pcm16.buffer),
//           mimeType: "audio/pcm;rate=16000",
//         },
//       });
//     };

//     source.connect(processor);
//     processor.connect(silentGain);
//     silentGain.connect(audioContext.destination);
//   }

//   const toggleMic = () => {
//     const next = !micOn;

//     setMicOn(next);

//     streamRef.current?.getAudioTracks().forEach((track) => {
//       track.enabled = next;
//     });
//   };

//   const toggleCamera = () => {
//     const next = !camOn;

//     setCamOn(next);

//     streamRef.current?.getVideoTracks().forEach((track) => {
//       track.enabled = next;
//     });
//   };

//   const formatClock = (seconds) =>
//     `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
//       seconds % 60
//     ).padStart(2, "0")}`;

//   if (stage === "ready") {
//     return (
//       <>
//         <ReadyCheck
//           onStart={startInterview}
//           starting={starting}
//         />

//         {error && (
//           <p
//             role="alert"
//             className="mx-auto max-w-2xl px-4 pb-4 text-sm text-red-600"
//           >
//             {error}
//           </p>
//         )}
//       </>
//     );
//   }

//   if (stage === "ended") {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
//         <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
//           <h1 className="text-2xl font-bold">Interview ended</h1>

//           <p className="mt-3 text-sm text-slate-600">
//             Your interview session has been closed.
//           </p>

//           <p className="mt-2 text-sm text-slate-500">
//             Duration: {formatClock(elapsed)}
//           </p>
//         </div>
//       </main>
//     );
//   }

//   return (
// <div
//   className="flex min-h-screen flex-col bg-slate-50"
//   data-testid="interview-room"
// >
//   <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
//     <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
//       <Logo className="hidden sm:inline-flex" />
//       <span className="hidden h-6 w-px bg-slate-200 sm:block" />

//       <div className="min-w-0">
//         <p
//           className="truncate text-sm font-semibold text-slate-900"
//           data-testid="room-title"
//         >
//           {interviewTitle}
//         </p>

//         <p className="truncate text-xs text-slate-500">
//           {company} · {candidateName}
//         </p>
//       </div>

//       <div className="ml-auto flex items-center gap-2">
//         <span
//           className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] font-medium text-emerald-700"
//           data-testid="room-live-status"
//         >
//           <Circle className="h-2 w-2 animate-pulse fill-current" />
//           LIVE
//         </span>

//         <span
//           className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs tabular-nums text-slate-700"
//           data-testid="room-duration"
//         >
//           {formatClock(elapsed)}
//         </span>
//       </div>
//     </div>

//     <div className="border-t border-slate-100 px-4 py-2.5 sm:px-6">
//       <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
//         <span>Interview progress</span>
//         <span>{Math.round(progress)}%</span>
//       </div>

//       <div
//         className="h-1.5 overflow-hidden rounded-full bg-slate-100"
//         role="progressbar"
//         aria-label="Interview time elapsed"
//         aria-valuemin={0}
//         aria-valuemax={100}
//         aria-valuenow={Math.round(progress)}
//       >
//         <div
//           className="h-full rounded-full bg-blue-600 transition-[width] duration-1000"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </div>
//   </header>

//   {error && (
//     <div
//       role="alert"
//       className="mx-auto mt-4 w-full max-w-5xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
//     >
//       {error}
//     </div>
//   )}

//   <main className="mx-auto grid w-full max-w-[1500px] flex-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2 lg:gap-5">
//     <CandidateTile
//       name={candidateName}
//       micOn={micOn}
//       camOn={camOn}
//       stream={stream}
//       answering={answering}
//       className={tileH}
//     />

//     <InterviewerTile
//       interviewer={interviewer="Interview AI Interviewer"}
//       speaking={speaking}
//       caption={captions ? currentText : null}
//       avatarSize={isDesktop ? 260 : 180}
//       className={tileH}
//     />

//     <section
//       className="rounded-xl border border-slate-200 bg-white p-5"
//       data-testid="candidate-answer-card"
//     >
//       <div className="flex items-center justify-between">
//         <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
//           Interview status
//         </p>

//         <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
//           <ShieldCheck className="h-3.5 w-3.5" />
//           Session active
//         </span>
//       </div>

//       <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
//         {!micOn ? (
//           <span className="text-rose-600">
//             Your microphone is muted. Unmute to answer.
//           </span>
//         ) : speaking ? (
//           <>
//             <SpeakingDots active className="text-blue-500" />
//             The AI interviewer is speaking...
//           </>
//         ) : answering ? (
//           <>
//             <SpeakingDots active className="text-emerald-500" />
//             Listening to your answer...
//           </>
//         ) : (
//           "Listen to the interviewer and answer naturally."
//         )}
//       </p>

//       <p className="mt-3 text-xs text-slate-400">
//         Take your time. The AI interviewer may ask follow-up questions based
//         on your responses.
//       </p>
//     </section>

//     <section
//       className={cn(
//         "rounded-xl border bg-white p-5 transition-colors",
//         speaking ? "border-blue-200" : "border-slate-200",
//         !captions && "opacity-60"
//       )}
//       data-testid="current-question-card"
//     >
//       <div className="flex items-center justify-between">
//         <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-blue-700">
//           <Sparkles className="h-3 w-3" />
//           Live captions
//         </p>

//         <button
//           type="button"
//           onClick={() => setCaptions((value) => !value)}
//           className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
//           data-testid="toggle-captions-button"
//         >
//           {captions ? "Hide captions" : "Show captions"}
//         </button>
//       </div>

//       <div
//         className={cn(
//           "mt-3 max-h-48 min-h-[52px] overflow-y-auto whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900",
//           speaking && "caret"
//         )}
//         data-testid="current-question-text"
//         aria-live="polite"
//       >
//         {captions
//           ? currentText || "Waiting for the interviewer..."
//           : "Captions are hidden."}
//       </div>
//     </section>
//   </main>

//   <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
//     <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-3 px-4 py-3 sm:justify-between sm:px-6">
//       <p className="hidden text-xs text-slate-500 sm:block">
//         {micOn ? "Microphone on" : "Microphone off"} ·{" "}
//         {camOn ? "Camera on" : "Camera off"}
//       </p>

//       <div className="flex items-center gap-2.5">
//         <CtlButton
//           on={micOn}
//           onClick={() => setMicOn((value) => !value)}
//           iconOn={Mic}
//           iconOff={MicOff}
//           label={micOn ? "Mute microphone" : "Unmute microphone"}
//           testId="toggle-mic-button"
//         />

//         <CtlButton
//           on={camOn}
//           onClick={() => setCamOn((value) => !value)}
//           iconOn={Video}
//           iconOff={VideoOff}
//           label={camOn ? "Turn camera off" : "Turn camera on"}
//           testId="toggle-camera-button"
//         />

//         <button
//           type="button"
//           onClick={() => setConfirm(true)}
//           className="ml-1 inline-flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
//           data-testid="end-interview-button"
//         >
//           <PhoneOff className="h-4 w-4" />
//           <span className="hidden sm:inline">End interview</span>
//         </button>
//       </div>

//       <p className="hidden w-[150px] text-right text-xs text-slate-400 sm:block">
//         AI-guided interview
//       </p>
//     </div>
//   </footer>

//   <AlertDialog open={confirm} onOpenChange={setConfirm}>
//     <AlertDialogContent data-testid="end-interview-dialog">
//       <AlertDialogHeader>
//         <AlertDialogTitle>
//           End the interview now?
//         </AlertDialogTitle>

//         <AlertDialogDescription>
//           Are you sure you want to end this interview? Your recorded
//           responses and transcript collected so far will be submitted
//           for evaluation, if supported by your submission handler.
//           You won't be able to rejoin this session.
//         </AlertDialogDescription>
//       </AlertDialogHeader>

//       <AlertDialogFooter>
//         <AlertDialogCancel data-testid="end-interview-cancel">
//           Continue interview
//         </AlertDialogCancel>

//         <AlertDialogAction
//           className="bg-rose-600 hover:bg-rose-700"
//           onClick={() => {
//             setConfirm(false);
//             endInterview();
//           }}
//           data-testid="end-interview-confirm"
//         >
//           End interview
//         </AlertDialogAction>
//       </AlertDialogFooter>
//     </AlertDialogContent>
//   </AlertDialog>
// </div>
//   );
// }

// function ControlButton({ onClick, active, label, icon: Icon }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={label}
//       title={label}
//       className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
//         active
//           ? "border-slate-200 bg-white hover:bg-slate-50"
//           : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
//       }`}
//     >
//       <Icon size={17} />
//       <span className="hidden sm:inline">{label}</span>
//     </button>
//   );
// }

// function resample(input, fromRate, toRate) {
//   if (fromRate === toRate) return input;

//   const ratio = fromRate / toRate;
//   const outputLength = Math.floor(input.length / ratio);
//   const output = new Float32Array(outputLength);

//   for (let i = 0; i < outputLength; i++) {
//     const index = Math.floor(i * ratio);
//     const nextIndex = Math.min(index + 1, input.length - 1);
//     const fraction = i * ratio - index;

//     output[i] =
//       input[index] * (1 - fraction) +
//       input[nextIndex] * fraction;
//   }

//   return output;
// }

// function floatTo16BitPcm(input) {
//   const output = new Int16Array(input.length);

//   for (let i = 0; i < input.length; i++) {
//     const sample = Math.max(-1, Math.min(1, input[i]));

//     output[i] =
//       sample < 0 ? sample * 32768 : sample * 32767;
//   }

//   return output;
// }

// function arrayBufferToBase64(buffer) {
//   const bytes = new Uint8Array(buffer);
//   let binary = "";

//   for (let i = 0; i < bytes.length; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }

//   return window.btoa(binary);
// }









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

// export function InterviewRoom({
//   id,
//   interview,
//   isPublic = false,
// }) {
//   const [stage, setStage] = useState("ready");
//   const [starting, setStarting] = useState(false);
//   const [error, setError] = useState("");
//   const [stream, setStream] = useState(null);
//   const [avatarStream, setAvatarStream] = useState(null);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const [screenStream, setScreenStream] = useState(null);

//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [answering, setAnswering] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);

//   const [captionsOn, setCaptionsOn] = useState(true);
//   const [caption, setCaption] = useState("");

//   const [elapsed, setElapsed] = useState(0);
//   const [confirm, setConfirm] = useState(false);

//   const sessionRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const processorRef = useRef(null);
//   const micSourceRef = useRef(null);
//   const silentGainRef = useRef(null);
//   const audioSourcesRef = useRef([]);
//   const nextPlayTimeRef = useRef(0);

//   const streamRef = useRef(null);
//   const startedAtRef = useRef(null);
//   const endingRef = useRef(false);

//   const candidateSpeakingRef = useRef(false);
//   const silenceFramesRef = useRef(0);
//   const avatarAudioDestinationRef = useRef(null);

//   const interviewTitle = interview?.title || "Interview";
//   const candidateName = interview?.candidate?.name || "Candidate";
//   const company = interview?.compName || interview?.compName || "Company";
//   const interviewId = interview?.id;
//   const organizationId = interview?.tenantId;
//   // console.log(interview,"interview",interviewId,organizationId,"organdinterview")

//   const questionRef = useRef("");
// const answerRef = useRef("");
// const savingRef = useRef(false);
// // console.log(isPublic,"isPublic");

// const saveExchange = async () => {
//   if (savingRef.current) return;

//   const question = questionRef.current.trim();
//   const answer = answerRef.current.trim();

//   if (!question || !answer) return;

//   savingRef.current = true;

//   try {
//     await interviewsService.saveExchange({
//       interviewId,
//       slug: id,
//       aiMsg:question,
//       userMsg:answer,
//       organizationId,
//       isPublic
//     });
//     // console.log(question,answer,"question and answer");

//     questionRef.current = "";
//     answerRef.current = "";
//   } catch (error) {
//     console.error(
//       "[Interview] Failed to save exchange:",
//       error
//     );
//   } finally {
//     savingRef.current = false;
//   }
// };


//   const progress = Math.min(
//     100,
//     (elapsed / INTERVIEW_DURATION) * 100
//   );

//   const formatClock = (seconds) =>
//     `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
//       seconds % 60
//     ).padStart(2, "0")}`;

//   const attachStream = useCallback((mediaStream) => {
//     streamRef.current = mediaStream;
//     setStream(mediaStream);
//   }, []);

//   // Keep elapsed time synchronized with the actual start timestamp.
//   useEffect(() => {
//     if (stage !== "live") return;

//     const timer = window.setInterval(() => {
//       if (startedAtRef.current) {
//         setElapsed(
//           Math.floor((Date.now() - startedAtRef.current) / 1000)
//         );
//       }
//     }, 1000);

//     return () => window.clearInterval(timer);
//   }, [stage]);

//   // Stop any queued AI audio.
//   const stopQueuedAudio = useCallback(() => {
//     const sources = [...audioSourcesRef.current];

//     audioSourcesRef.current = [];
//     nextPlayTimeRef.current = 0;

//     for (const source of sources) {
//       source.onended = null;

//       try {
//         source.stop();
//       } catch {
//         // The audio source may already have stopped.
//       }

//       try {
//         source.disconnect();
//       } catch {
//         // The audio source may already be disconnected.
//       }
//     }

//     setAiSpeaking(false);
//   }, []);

//   // Clean up the microphone processor and audio playback context.
//   const stopAudioPipeline = useCallback(async () => {
//     if (processorRef.current) {
//       processorRef.current.onaudioprocess = null;
//       processorRef.current.disconnect();
//     }

//     micSourceRef.current?.disconnect();
//     silentGainRef.current?.disconnect();

//     const sources = [...audioSourcesRef.current];
//     audioSourcesRef.current = [];
//     nextPlayTimeRef.current = 0;

//     for (const source of sources) {
//       source.onended = null;

//       try {
//         source.stop();
//       } catch {}

//       try {
//         source.disconnect();
//       } catch {}
//     }

//     try {
//       await audioContextRef.current?.close();
//     } catch (err) {
//       console.warn("[Gemini Live] Audio cleanup failed:", err);
//     }

//     processorRef.current = null;
//     micSourceRef.current = null;
//     silentGainRef.current = null;
//     audioContextRef.current = null;
//   }, []);

//   // End the interview and release all media resources.
//   const endInterview = useCallback(async () => {
//     if (endingRef.current) return;

//     endingRef.current = true;

//     const session = sessionRef.current;
//     sessionRef.current = null;

//     try {
//       session?.close();
//     } catch (err) {
//       console.warn("[Gemini Live] Session close failed:", err);
//     }

//     await stopAudioPipeline();

//     streamRef.current?.getTracks().forEach((track) => track.stop());

//     streamRef.current = null;
//     startedAtRef.current = null;
//     candidateSpeakingRef.current = false;
//     silenceFramesRef.current = 0;

//     setStream(null);
//     setAnswering(false);
//     setAiSpeaking(false);
//     setStage("ended");
//   }, [stopAudioPipeline]);

//   // Release resources if the component unmounts.
//   useEffect(() => {
//     return () => {
//       endingRef.current = true;

//       try {
//         sessionRef.current?.close();
//       } catch {}

//       sessionRef.current = null;

//       if (processorRef.current) {
//         processorRef.current.onaudioprocess = null;
//         processorRef.current.disconnect();
//       }

//       micSourceRef.current?.disconnect();
//       silentGainRef.current?.disconnect();

//       for (const source of audioSourcesRef.current) {
//         source.onended = null;

//         try {
//           source.stop();
//         } catch {}

//         try {
//           source.disconnect();
//         } catch {}
//       }

//       audioSourcesRef.current = [];

//       try {
//         audioContextRef.current?.close();
//       } catch {}

//       streamRef.current?.getTracks().forEach((track) => track.stop());
//     };
//   }, []);

  



//   // Start the Gemini Live interview.
//   const startInterview = async (mediaStream,screenStream) => {
//     setStarting(true);
//     setError("");
//     setAnswering(false);
//     setAiSpeaking(false);
//     setCaption("");
//     setElapsed(0);

//     endingRef.current = false;
//     candidateSpeakingRef.current = false;
//     silenceFramesRef.current = 0;
//     startedAtRef.current = null;

//     let session = null;

//     try {
//       if (!MODEL) {
//         throw new Error(
//           "Gemini Live model is not configured. Set REACT_APP_GEMINI_LIVE_MODEL."
//         );
//       }

//       const result = await interviewsService.getLiveSession(id, isPublic);
//       const token = result?.token ?? result?.data?.token;

//       if (!token || typeof token !== "string") {
//         throw new Error("Failed to get Gemini Live session token.");
//       }

//       if (endingRef.current) {
//         mediaStream.getTracks().forEach((track) => track.stop());
//         return;
//       }

//       attachStream(mediaStream);

//       let audioContext = audioContextRef.current;

//       if (!audioContext || audioContext.state === "closed") {
//         audioContext = new AudioContext({ sampleRate: 24000 });
//         audioContextRef.current = audioContext;
//       }

//       if (audioContext.state === "suspended") {
//         await audioContext.resume();
//       }

//       const ai = new GoogleGenAI({
//         apiKey: token,
//         httpOptions: {
//           apiVersion: "v1alpha",
//         },
//       });

//       session = await ai.live.connect({
//         model: MODEL,

//         callbacks: {
//           onopen: () => {
//             if (endingRef.current) return;

//             console.log("[Gemini Live] Connected");

//             startedAtRef.current = Date.now();
//             setElapsed(0);
//             setStage("live");
//             setStarting(false);
//           },

         

// onmessage: async (message) => {
//   if (endingRef.current) return;

//   const content = message.serverContent;
//   if (!content) return;

//   // Candidate transcription
//   const inputText = content.inputTranscription?.text;

//   if (inputText) {
//     console.log("[Gemini Live] Candidate:", inputText);

//     if (!content.outputTranscription?.text) {
//       setCaption(inputText);
//     }

//     answerRef.current += inputText;
//   }

//   // AI transcription
//   const outputText = content.outputTranscription?.text;

//   if (outputText) {
//     console.log("[Gemini Live] Interviewer:", outputText);
//     setCaption(outputText);

//     questionRef.current += outputText;
//   }

//   // Stop queued playback if Gemini interrupts its response.
//   if (content.interrupted) {
//     console.log("[Gemini Live] Response interrupted");
//     stopQueuedAudio();
//   }

//   // Play AI audio
//   const parts = content.modelTurn?.parts ?? [];

//   for (const part of parts) {
//     if (endingRef.current) return;

//     const inlineData = part.inlineData;
//     if (!inlineData?.data) continue;

//     const mimeType = inlineData.mimeType ?? "";

//     if (!mimeType.startsWith("audio/")) continue;

//     try {
//       const context = audioContextRef.current;

//       if (!context || context.state === "closed") continue;

//       if (context.state === "suspended") {
//         await context.resume();
//       }

//       if (endingRef.current) return;

//       const binary = atob(inlineData.data);
//       const bytes = new Uint8Array(binary.length);

//       for (let i = 0; i < binary.length; i++) {
//         bytes[i] = binary.charCodeAt(i);
//       }

//       const rateMatch = mimeType.match(/rate=(\d+)/i);
//       const sampleRate = rateMatch
//         ? Number(rateMatch[1])
//         : 24000;

//       if (
//         !Number.isFinite(sampleRate) ||
//         sampleRate <= 0 ||
//         bytes.byteLength === 0 ||
//         bytes.byteLength % 2 !== 0
//       ) {
//         console.error(
//           "[Gemini Live] Invalid PCM audio data"
//         );
//         continue;
//       }

//       const alignedBuffer = bytes.buffer.slice(
//         bytes.byteOffset,
//         bytes.byteOffset + bytes.byteLength
//       );

//       const samples = new Int16Array(alignedBuffer);

//       const audioBuffer = context.createBuffer(
//         1,
//         samples.length,
//         sampleRate
//       );

//       const channel = audioBuffer.getChannelData(0);

//       for (let i = 0; i < samples.length; i++) {
//         channel[i] = samples[i] / 32768;
//       }

//       const source = context.createBufferSource();
//       source.buffer = audioBuffer;
//       source.connect(context.destination);

//       const now = context.currentTime;

//       if (nextPlayTimeRef.current < now) {
//         nextPlayTimeRef.current = now;
//       }

//       source.start(nextPlayTimeRef.current);
//       nextPlayTimeRef.current += audioBuffer.duration;

//       audioSourcesRef.current.push(source);
//       setAiSpeaking(true);

//       source.onended = () => {
//         audioSourcesRef.current =
//           audioSourcesRef.current.filter(
//             (item) => item !== source
//           );

//         try {
//           source.disconnect();
//         } catch {}

//         const currentContext = audioContextRef.current;

//         if (
//           audioSourcesRef.current.length === 0 &&
//           currentContext &&
//           currentContext.state !== "closed" &&
//           nextPlayTimeRef.current <=
//             currentContext.currentTime + 0.05
//         ) {
//           setAiSpeaking(false);
//         }
//       };
//     } catch (audioError) {
//       console.error(
//         "[Gemini Live] Audio playback failed:",
//         audioError
//       );
//     }
//   }

//   if (content.turnComplete) {
//     console.log("[Gemini Live] Turn complete");

//     // Basic guard: save only if both texts are present.
//     // This does NOT guarantee the candidate transcription
//     // has finished or that the text belongs to one exchange.
//     if (
//       questionRef.current.trim() &&
//       answerRef.current.trim()
//     ) {
//       await saveExchange();
//     }
//   }
// },



//           onerror: (event) => {
//             console.error("[Gemini Live] Connection error:", event);

//             if (!endingRef.current) {
//               setError("The live interview encountered an error.");
//             }
//           },

//           onclose: (event) => {
//             console.warn("[Gemini Live] Connection closed:", {
//               code: event?.code,
//               reason: event?.reason,
//               wasClean: event?.wasClean,
//             });

//             if (!endingRef.current) {
//               stopQueuedAudio();

//               candidateSpeakingRef.current = false;
//               silenceFramesRef.current = 0;

//               setAnswering(false);
//               setAiSpeaking(false);
//               setError("The Gemini Live connection was closed.");
//               setStage("ended");
//             }
//           },
//         },
//       });

//       if (endingRef.current) {
//         session.close();
//         return;
//       }

//       sessionRef.current = session;

//       await startMicrophoneStreaming(mediaStream, audioContext, session);

//       if (endingRef.current) return;

//       console.log("[Gemini Live] Microphone streaming started");

//       // Send an initial turn so Gemini starts the interview
//       // without waiting for the candidate to speak first.
//       session.sendClientContent({
//         turns: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: "I am ready. Begin the interview now.",
//               },
//             ],
//           },
//         ],
//         turnComplete: true,
//       });

//       console.log("[Gemini Live] Initial prompt sent");
//     } catch (err) {
//       console.error("[Gemini Live] Failed to start:", err);

//       endingRef.current = true;

//       if (sessionRef.current === session) {
//         sessionRef.current = null;
//       }

//       try {
//         session?.close();
//       } catch {}

//       await stopAudioPipeline();

//       mediaStream.getTracks().forEach((track) => track.stop());

//       streamRef.current = null;
//       startedAtRef.current = null;

//       setStream(null);
//       setAnswering(false);
//       setAiSpeaking(false);
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to start the interview."
//       );

//       setStage("ready");
//     } finally {
//       setStarting(false);
//     }
//   };

//   // Stream microphone PCM to Gemini and detect approximate
//   // candidate speech activity from microphone volume.
//   async function startMicrophoneStreaming(
//     mediaStream,
//     audioContext,
//     session
//   ) {
//     if (!mediaStream.getAudioTracks().length) {
//       throw new Error("No microphone track is available.");
//     }

//     const source = audioContext.createMediaStreamSource(mediaStream);
//     const processor = audioContext.createScriptProcessor(4096, 1, 1);
//     const silentGain = audioContext.createGain();

//     silentGain.gain.value = 0;

//     micSourceRef.current = source;
//     processorRef.current = processor;
//     silentGainRef.current = silentGain;

//     const SPEECH_THRESHOLD = 0.025;
//     const SILENCE_THRESHOLD = 0.012;
//     const SILENCE_FRAMES_TO_STOP = 8;

//     processor.onaudioprocess = (event) => {
//       if (
//         endingRef.current ||
//         !sessionRef.current ||
//         sessionRef.current !== session
//       ) {
//         return;
//       }

//       const input = event.inputBuffer.getChannelData(0);

//       let sumSquares = 0;

//       for (let i = 0; i < input.length; i++) {
//         sumSquares += input[i] * input[i];
//       }

//       const rms = Math.sqrt(sumSquares / input.length);

//       if (rms >= SPEECH_THRESHOLD) {
//         silenceFramesRef.current = 0;

//         if (!candidateSpeakingRef.current) {
//           candidateSpeakingRef.current = true;
//           setAnswering(true);
//         }
//       } else if (rms < SILENCE_THRESHOLD) {
//         silenceFramesRef.current += 1;

//         if (
//           candidateSpeakingRef.current &&
//           silenceFramesRef.current >= SILENCE_FRAMES_TO_STOP
//         ) {
//           candidateSpeakingRef.current = false;
//           silenceFramesRef.current = 0;
//           setAnswering(false);
//         }
//       }

//       const pcm16 = floatTo16BitPcm(
//         resample(input, audioContext.sampleRate, 16000)
//       );

//       if (!pcm16.length) return;

//       try {
//         session.sendRealtimeInput({
//           audio: {
//             data: arrayBufferToBase64(pcm16.buffer),
//             mimeType: "audio/pcm;rate=16000",
//           },
//         });
//       } catch (err) {
//         console.error("[Gemini Live] Microphone send failed:", err);
//       }
//     };

//     source.connect(processor);
//     processor.connect(silentGain);
//     silentGain.connect(audioContext.destination);
//   }

//   const toggleMic = () => {
//     const next = !micOn;

//     streamRef.current?.getAudioTracks().forEach((track) => {
//       track.enabled = next;
//     });

//     setMicOn(next);

//     if (!next) {
//       candidateSpeakingRef.current = false;
//       silenceFramesRef.current = 0;
//       setAnswering(false);
//     }
//   };

//   const toggleCamera = () => {
//     const next = !camOn;

//     streamRef.current?.getVideoTracks().forEach((track) => {
//       track.enabled = next;
//     });

//     setCamOn(next);
//   };

//   if (stage === "ready") {
//     return (
//       <>
//       <ReadyCheck
//   starting={starting}
//   onStart={(mediaStream, screenStream) =>
//     startInterview(mediaStream, screenStream)
//   }
//   onScreenShareChange={(isSharing, screenStream) => {
//     setScreenSharing(isSharing);
//     setScreenStream(screenStream);
//   }}
// />

//         {error && (
//           <p
//             role="alert"
//             className="mx-auto max-w-2xl px-4 pb-4 text-sm text-red-600"
//           >
//             {error}
//           </p>
//         )}
//       </>
//     );
//   }

//   if (stage === "ended") {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
//         <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
//           <h1 className="text-2xl font-bold">Interview ended</h1>

//           <p className="mt-3 text-sm text-slate-600">
//             Your interview session has been closed.
//           </p>

//           <p className="mt-2 text-sm text-slate-500">
//             Duration: {formatClock(elapsed)}
//           </p>

//           {error && (
//             <p role="alert" className="mt-3 text-sm text-red-600">
//               {error}
//             </p>
//           )}
//         </div>
//       </main>
//     );
//   }

//   return (
//     <div
//       className="flex min-h-screen flex-col bg-slate-50"
//       data-testid="interview-room"
//     >
//       <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
//         <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
//           <Logo className="hidden sm:inline-flex" />
//           <span className="hidden h-6 w-px bg-slate-200 sm:block" />

//           <div className="min-w-0">
//             <p
//               className="truncate text-sm font-semibold text-slate-900"
//               data-testid="room-title"
//             >
//               {interviewTitle}
//             </p>

//             <p className="truncate text-xs text-slate-500">
//               {company} · {candidateName}
//             </p>
//           </div>

//           <div className="ml-auto flex items-center gap-2">
//             <span
//               className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] font-medium text-emerald-700"
//               data-testid="room-live-status"
//             >
//               <Circle className="h-2 w-2 animate-pulse fill-current" />
//               LIVE
//             </span>

//             <span
//               className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs tabular-nums text-slate-700"
//               data-testid="room-duration"
//             >
//               {formatClock(elapsed)}
//             </span>
//           </div>
//         </div>

//         <div className="border-t border-slate-100 px-4 py-2.5 sm:px-6">
//           <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
//             <span>Interview progress</span>
//             <span>{Math.round(progress)}%</span>
//           </div>

//           <div
//             className="h-1.5 overflow-hidden rounded-full bg-slate-100"
//             role="progressbar"
//             aria-label="Interview time elapsed"
//             aria-valuemin={0}
//             aria-valuemax={100}
//             aria-valuenow={Math.round(progress)}
//           >
//             <div
//               className="h-full rounded-full bg-blue-600 transition-[width] duration-1000"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>
//       </header>

//       {error && (
//         <div
//           role="alert"
//           className="mx-auto mt-4 w-full max-w-5xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
//         >
//           {error}
//         </div>
//       )}

//       <main className="mx-auto grid w-full max-w-[1500px] flex-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2 lg:gap-5">
//         <CandidateTile
//           name={candidateName}
//           micOn={micOn}
//           camOn={camOn}
//           stream={stream}
//           answering={answering}
//           className="min-h-[280px]"
//         />

//         <InterviewerTile
//           interviewer="AI Interviewer"
//           speaking={aiSpeaking}
//           caption={captionsOn ? caption : null}
//           avatarSize={260}
//           stream={avatarStream}
//           className="min-h-[280px]"
//         />

//         <section
//           className="rounded-xl border border-slate-200 bg-white p-5"
//           data-testid="candidate-answer-card"
//         >
//           <div className="flex items-center justify-between">
//             <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
//               Interview status
//             </p>

//             <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
//               <ShieldCheck className="h-3.5 w-3.5" />
//               Session active
//             </span>
//           </div>

//           <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
//             {!micOn ? (
//               <span className="text-rose-600">
//                 Your microphone is muted. Unmute to answer.
//               </span>
//             ) : aiSpeaking ? (
//               <>
//                 <SpeakingDots active className="text-blue-500" />
//                 The AI interviewer is speaking...
//               </>
//             ) : answering ? (
//               <>
//                 <SpeakingDots active className="text-emerald-500" />
//                 Listening to your answer...
//               </>
//             ) : (
//               "Listen to the interviewer and answer naturally."
//             )}
//           </p>

//           <p className="mt-3 text-xs text-slate-400">
//             Take your time. The AI interviewer may ask follow-up questions
//             based on your responses.
//           </p>
//         </section>

//         <section
//           className={cn(
//             "rounded-xl border bg-white p-5 transition-colors",
//             aiSpeaking ? "border-blue-200" : "border-slate-200",
//             !captionsOn && "opacity-60"
//           )}
//           data-testid="current-question-card"
//         >
//           <div className="flex items-center justify-between">
//             <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-blue-700">
//               <Sparkles className="h-3 w-3" />
//               Live captions
//             </p>

//             <button
//               type="button"
//               onClick={() => setCaptionsOn((value) => !value)}
//               className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
//               data-testid="toggle-captions-button"
//             >
//               {captionsOn ? "Hide captions" : "Show captions"}
//             </button>
//           </div>

//           <div
//             className={cn(
//               "mt-3 max-h-48 min-h-[52px] overflow-y-auto whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900",
//               aiSpeaking && "caret"
//             )}
//             data-testid="current-question-text"
//             aria-live="polite"
//           >
//             {captionsOn
//               ? caption || "Waiting for the interviewer..."
//               : "Captions are hidden."}
//           </div>
//         </section>
//       </main>

//       <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
//         <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-3 px-4 py-3 sm:justify-between sm:px-6">
//           <p className="hidden text-xs text-slate-500 sm:block">
//             {micOn ? "Microphone on" : "Microphone off"} ·{" "}
//             {camOn ? "Camera on" : "Camera off"}
//           </p>

//           <div className="flex items-center gap-2.5">
//             <ControlButton
//               active={micOn}
//               onClick={toggleMic}
//               label={micOn ? "Mute microphone" : "Unmute microphone"}
//               icon={micOn ? Mic : MicOff}
//             />

//             <ControlButton
//               active={camOn}
//               onClick={toggleCamera}
//               label={camOn ? "Turn camera off" : "Turn camera on"}
//               icon={camOn ? Video : VideoOff}
//             />

//             <button
//               type="button"
//               onClick={() => setConfirm(true)}
//               className="ml-1 inline-flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
//               data-testid="end-interview-button"
//             >
//               <PhoneOff className="h-4 w-4" />
//               <span className="hidden sm:inline">End interview</span>
//             </button>
//           </div>

//           <p className="hidden w-[150px] text-right text-xs text-slate-400 sm:block">
//             AI-guided interview
//           </p>
//         </div>
//       </footer>

//       <AlertDialog open={confirm} onOpenChange={setConfirm}>
//         <AlertDialogContent data-testid="end-interview-dialog">
//           <AlertDialogHeader>
//             <AlertDialogTitle>End the interview now?</AlertDialogTitle>

//             <AlertDialogDescription>
//               Are you sure you want to end this interview? You will not be
//               able to rejoin this session.
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel data-testid="end-interview-cancel">
//               Continue interview
//             </AlertDialogCancel>

//             <AlertDialogAction
//               className="bg-rose-600 hover:bg-rose-700"
//               onClick={() => {
//                 setConfirm(false);
//                 endInterview();
//               }}
//               data-testid="end-interview-confirm"
//             >
//               End interview
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }






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
  const nextPlayTimeRef = useRef(0);

  const recordingStreamRef = useRef(null);
  const recordingAudioContextRef = useRef(null);
  const recordingDestinationRef = useRef(null);
  const recordingMicSourceRef = useRef(null);
  const recordingScreenAudioSourceRef = useRef(null);

  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const startedAtRef = useRef(null);
  const endingRef = useRef(false);

  const candidateSpeakingRef = useRef(false);
  const silenceFramesRef = useRef(0);

  const questionRef = useRef("");
  const answerRef = useRef("");
  const savingRef = useRef(false);

  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const uploadIdRef = useRef(null);
  const recordingKeyRef = useRef(null);
  const nextPartNumberRef = useRef(1);
  const presignedUrlsRef = useRef(new Map());
  const urlBatchRequestsRef = useRef(new Map());
  const presignedBatchPromisesRef = useRef(new Map());
  const completedPartsRef = useRef([]);
  const recordingErrorRef = useRef(null);
  const blobProcessingPromiseRef = useRef(Promise.resolve());
  const recordingStartedRef = useRef(false);
  const recordingFinalizedRef = useRef(false);
  const recordingStopPromiseRef = useRef(null);
  const uploadQueueRef = useRef(Promise.resolve());

  const PART_SIZE = 10 * 1024 * 1024;
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

  const saveExchange = async () => {
    if (savingRef.current) return;

    const question = questionRef.current.trim();
    const answer = answerRef.current.trim();

    if (!question || !answer) return;

    savingRef.current = true;

    try {
      await interviewsService.saveExchange({
        interviewId,
        slug: id,
        aiMsg: question,
        userMsg: answer,
        organizationId,
        isPublic,
      });

      questionRef.current = "";
      answerRef.current = "";
    } catch (err) {
      console.error("[Interview] Failed to save exchange:", err);
    } finally {
      savingRef.current = false;
    }
  };

  const fetchPresignedUrls = async (startPart) => {
    const existingRequest =
      urlBatchRequestsRef.current.get(startPart);

    if (existingRequest) {
      await existingRequest;
      return;
    }

    const request = (async () => {
      const result = await interviewsService.getInterviewVideoUrls(
        interviewId,
        uploadIdRef.current,
        startPart,
        URL_BATCH_SIZE
      );

      const response = result?.data ?? result;
      const urls = response?.urls ?? [];

      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error(
          `The server returned no upload URLs for part ${startPart}.`
        );
      }

      urls.forEach((item, index) => {
        const partNumber =
          typeof item === "string"
            ? startPart + index
            : item.partNumber ?? startPart + index;

        const url =
          typeof item === "string"
            ? item
            : item.url;

        if (url) {
          presignedUrlsRef.current.set(partNumber, url);
        }
      });
    })();

    urlBatchRequestsRef.current.set(startPart, request);

    try {
      await request;
    } finally {
      if (
        urlBatchRequestsRef.current.get(startPart) === request
      ) {
        urlBatchRequestsRef.current.delete(startPart);
      }
    }
  };

  const ensurePresignedUrls = async (partNumber) => {
    if (presignedUrlsRef.current.has(partNumber)) {
      return;
    }

    const startPart =
      Math.floor((partNumber - 1) / URL_BATCH_SIZE) *
        URL_BATCH_SIZE +
      1;

    if (!presignedBatchPromisesRef.current.has(startPart)) {
      const promise = fetchPresignedUrls(startPart).finally(() => {
        presignedBatchPromisesRef.current.delete(startPart);
      });

      presignedBatchPromisesRef.current.set(startPart, promise);
    }

    await presignedBatchPromisesRef.current.get(startPart);

    if (!presignedUrlsRef.current.has(partNumber)) {
      throw new Error(
        `No presigned URL available for part ${partNumber}.`
      );
    }
  };

  const replenishUrlsIfNeeded = () => {
    const remaining = [
      ...presignedUrlsRef.current.keys(),
    ].filter(
      (partNumber) =>
        partNumber >= nextPartNumberRef.current
    ).length;

    if (remaining > URL_BATCH_SIZE / 2) return;

    const nextBatchStart =
      Math.floor(
        (nextPartNumberRef.current - 1) / URL_BATCH_SIZE
      ) *
        URL_BATCH_SIZE +
      URL_BATCH_SIZE +
      1;

    if (
      presignedUrlsRef.current.has(nextBatchStart) ||
      urlBatchRequestsRef.current.has(nextBatchStart)
    ) {
      return;
    }

    fetchPresignedUrls(nextBatchStart).catch((err) => {
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

      const response = await fetch(url, {
        method: "PUT",
        body: blob,
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");

        throw new Error(
          `Part ${partNumber} upload failed: ${response.status} ${details}`
        );
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

    uploadQueueRef.current = uploadTask.catch(() => {});

    return uploadTask;
  };

  const processRecordingBlob = async (blob) => {
    if (!blob?.size) return;

    recordingChunksRef.current.push(blob);

    let totalSize = recordingChunksRef.current.reduce(
      (total, chunk) => total + chunk.size,
      0
    );

    while (totalSize >= PART_SIZE) {
      const combinedBlob = new Blob(
        recordingChunksRef.current,
        {
          type: recorderRef.current?.mimeType || "video/webm",
        }
      );

      const partBlob = combinedBlob.slice(0, PART_SIZE);
      const remainder = combinedBlob.slice(PART_SIZE);

      recordingChunksRef.current = remainder.size
        ? [remainder]
        : [];

      totalSize = remainder.size;

      await uploadRecordingPart(partBlob);
    }
  };

  const flushRemainingRecording = async () => {
    if (!recordingChunksRef.current.length) return;

    const finalBlob = new Blob(
      recordingChunksRef.current,
      {
        type: recorderRef.current?.mimeType || "video/webm",
      }
    );

    recordingChunksRef.current = [];

    if (finalBlob.size > 0) {
      await uploadRecordingPart(finalBlob);
    }
  };

  const startScreenRecording = async (mediaStream) => {
    if (!mediaStream?.getVideoTracks().some(
      (track) => track.readyState === "live"
    )) {
      throw new Error("Screen sharing video is unavailable.");
    }

    if (!mediaStream?.getAudioTracks().some(
      (track) => track.readyState === "live"
    )) {
      throw new Error("Recording audio is unavailable.");
    }

    if (!window.MediaRecorder) {
      throw new Error(
        "MediaRecorder is not supported in this browser."
      );
    }

    const mimeType = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type));

    if (!mimeType) {
      throw new Error(
        "No supported recording format was found."
      );
    }

    const result = await interviewsService.startInterviewUpload(
      interviewId,
      organizationId
    );

    const response = result?.data ?? result;
    const uploadId = response?.uploadId;

    if (!uploadId) {
      throw new Error(
        "Failed to initialize the video upload."
      );
    }

    uploadIdRef.current = uploadId;
    recordingKeyRef.current = interviewId;

    nextPartNumberRef.current = 1;
    completedPartsRef.current = [];
    recordingChunksRef.current = [];
    recordingErrorRef.current = null;
    blobProcessingPromiseRef.current = Promise.resolve();
    recordingStartedRef.current = false;
    recordingFinalizedRef.current = false;
    recordingStopPromiseRef.current = null;
    uploadQueueRef.current = Promise.resolve();

    presignedUrlsRef.current.clear();
    urlBatchRequestsRef.current.clear();
    presignedBatchPromisesRef.current.clear();

    await fetchPresignedUrls(1);

    const recorder = new MediaRecorder(mediaStream, {
      mimeType,
    });

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (!event.data?.size) return;

      blobProcessingPromiseRef.current =
        blobProcessingPromiseRef.current
          .then(async () => {
            if (recordingErrorRef.current) return;

            await processRecordingBlob(event.data);
          })
          .catch((err) => {
            recordingErrorRef.current = err;

            console.error(
              "[Recording] Blob processing failed:",
              err
            );
          });
    };

    recorder.onstop = () => {
      console.log("[Recording] MediaRecorder stopped.");
    };

    recorder.onerror = (event) => {
      recordingErrorRef.current =
        event.error ||
        new Error("Screen recording failed.");

      console.error("[Recording] Recorder error:", event);
    };

    recorder.start(5000);
    recordingStartedRef.current = true;

    mediaStream.getVideoTracks()[0].addEventListener(
      "ended",
      () => {
        if (recorder.state !== "inactive") {
          recorder.stop();
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

      if (recordingErrorRef.current) {
        throw recordingErrorRef.current;
      }

      await uploadQueueRef.current;

      await flushRemainingRecording();

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
        throw new Error(
          "The recording contains no uploaded parts."
        );
      }

      const result =
        await interviewsService.InterviewVideoComplete(
          interviewId,
          uploadIdRef.current,
          parts
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
          Math.floor(
            (Date.now() - startedAtRef.current) / 1000
          )
        );
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage]);

  const stopQueuedAudio = useCallback(() => {
    const sources = [...audioSourcesRef.current];

    audioSourcesRef.current = [];
    nextPlayTimeRef.current = 0;

    for (const source of sources) {
      source.onended = null;

      try {
        source.stop();
      } catch {}

      try {
        source.disconnect();
      } catch {}
    }

    setAiSpeaking(false);
  }, []);

  const stopAudioPipeline = useCallback(async () => {
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;

      try {
        processorRef.current.disconnect();
      } catch {}
    }

    try {
      micSourceRef.current?.disconnect();
    } catch {}

    try {
      silentGainRef.current?.disconnect();
    } catch {}

    const sources = [...audioSourcesRef.current];

    audioSourcesRef.current = [];
    nextPlayTimeRef.current = 0;

    for (const source of sources) {
      source.onended = null;

      try {
        source.stop();
      } catch {}

      try {
        source.disconnect();
      } catch {}
    }

    try {
      await audioContextRef.current?.close();
    } catch (err) {
      console.warn(
        "[Gemini Live] Audio cleanup failed:",
        err
      );
    }

    processorRef.current = null;
    micSourceRef.current = null;
    silentGainRef.current = null;
    audioContextRef.current = null;
  }, []);

  const stopRecordingAudioPipeline = useCallback(async () => {
    try {
      recordingMicSourceRef.current?.disconnect();
    } catch {}

    try {
      recordingScreenAudioSourceRef.current?.disconnect();
    } catch {}

    try {
      if (
        recordingAudioContextRef.current &&
        recordingAudioContextRef.current.state !== "closed"
      ) {
        await recordingAudioContextRef.current.close();
      }
    } catch (err) {
      console.warn(
        "[Recording] Audio cleanup failed:",
        err
      );
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

    try {
      if (
        recordingStartedRef.current ||
        uploadIdRef.current
      ) {
        await stopScreenRecording();
      }
    } catch (err) {
      console.error(
        "[Recording] Finalization failed:",
        err
      );

      setError(
        "The interview ended, but the recording could not be finalized."
      );
    }

    const session = sessionRef.current;
    sessionRef.current = null;

    try {
      session?.close();
    } catch (err) {
      console.warn(
        "[Gemini Live] Session close failed:",
        err
      );
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
  }, [
    stopAudioPipeline,
    stopRecordingAudioPipeline,
  ]);

  useEffect(() => {
    return () => {
      endingRef.current = true;

      try {
        sessionRef.current?.close();
      } catch {}

      sessionRef.current = null;

      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {}
      }

      if (processorRef.current) {
        processorRef.current.onaudioprocess = null;

        try {
          processorRef.current.disconnect();
        } catch {}
      }

      try {
        micSourceRef.current?.disconnect();
      } catch {}

      try {
        silentGainRef.current?.disconnect();
      } catch {}

      try {
        recordingMicSourceRef.current?.disconnect();
      } catch {}

      try {
        recordingScreenAudioSourceRef.current?.disconnect();
      } catch {}

      for (const source of audioSourcesRef.current) {
        source.onended = null;

        try {
          source.stop();
        } catch {}

        try {
          source.disconnect();
        } catch {}
      }

      audioSourcesRef.current = [];

      try {
        audioContextRef.current?.close();
      } catch {}

      try {
        recordingAudioContextRef.current?.close();
      } catch {}

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
    sharedScreenStream
  ) => {
    setStarting(true);
    setError("");
    setAnswering(false);
    setAiSpeaking(false);
    setCaption("");
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
        !mediaStream.getAudioTracks().some(
          (track) => track.readyState === "live"
        )
      ) {
        throw new Error("An active microphone is required.");
      }

      if (
        !mediaStream.getVideoTracks().some(
          (track) => track.readyState === "live"
        )
      ) {
        throw new Error("An active camera is required.");
      }

      if (
        !sharedScreenStream ||
        !sharedScreenStream.getVideoTracks().some(
          (track) => track.readyState === "live"
        )
      ) {
        throw new Error("Screen sharing is required.");
      }

      attachStream(mediaStream);

      screenStreamRef.current = sharedScreenStream;

      const recordingAudioContext = new AudioContext();

      await recordingAudioContext.resume();

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

      const screenAudioTracks =
        sharedScreenStream.getAudioTracks().filter(
          (track) => track.readyState === "live"
        );

      if (screenAudioTracks.length > 0) {
        const screenAudioSource =
          recordingAudioContext.createMediaStreamSource(
            new MediaStream(screenAudioTracks)
          );

        screenAudioSource.connect(recordingDestination);

        recordingScreenAudioSourceRef.current =
          screenAudioSource;
      }

      const combinedRecordingStream = new MediaStream([
        ...sharedScreenStream.getVideoTracks(),
        ...recordingDestination.stream.getAudioTracks(),
      ]);

      recordingStreamRef.current = combinedRecordingStream;

      await startScreenRecording(combinedRecordingStream);

      const result = await interviewsService.getLiveSession(
        id,
        isPublic
      );

      const token = result?.token ?? result?.data?.token;

      if (!token || typeof token !== "string") {
        throw new Error(
          "Failed to get Gemini Live session token."
        );
      }

      if (endingRef.current) return;

      let audioContext = audioContextRef.current;

      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioContext({
          sampleRate: 24000,
        });

        audioContextRef.current = audioContext;
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: {
          apiVersion: "v1alpha",
        },
      });

      session = await ai.live.connect({
        model: MODEL,

        callbacks: {
          onopen: () => {
            if (endingRef.current) return;

            console.log("[Gemini Live] Connected");

            startedAtRef.current = Date.now();
            setElapsed(0);
            setStage("live");
            setStarting(false);
          },

onmessage: async (message) => {
  if (endingRef.current) return;

  const content = message.serverContent;

  if (!content) return;

  const inputText = content.inputTranscription?.text;

  if (inputText) {
    if (!content.outputTranscription?.text) {
      setCaption(inputText);
    }

    answerRef.current += inputText;
  }

  const outputText = content.outputTranscription?.text;

  if (outputText) {
    setCaption(outputText);
    questionRef.current += outputText;
  }

  if (content.interrupted) {
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

      const recordingContext =
        recordingAudioContextRef.current;

      const recordingDestination =
        recordingDestinationRef.current;

      if (
        recordingContext &&
        recordingContext.state !== "closed" &&
        recordingDestination
      ) {
        const recordingBuffer =
          recordingContext.createBuffer(
            1,
            samples.length,
            sampleRate
          );

        const recordingChannel =
          recordingBuffer.getChannelData(0);

        recordingChannel.set(channel);

        const recordingSource =
          recordingContext.createBufferSource();

        recordingSource.buffer = recordingBuffer;

        recordingSource.connect(recordingDestination);

        const recordingStartTime =
          Math.max(
            recordingContext.currentTime,
            recordingContext.currentTime +
              (startTime - context.currentTime)
          );

        recordingSource.start(recordingStartTime);

        recordingSource.onended = () => {
          try {
            recordingSource.disconnect();
          } catch {}
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
        } catch {}

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

  if (
    content.turnComplete &&
    questionRef.current.trim() &&
    answerRef.current.trim()
  ) {
    await saveExchange();
  }
},

          onerror: (event) => {
            console.error(
              "[Gemini Live] Connection error:",
              event
            );

            if (!endingRef.current) {
              setError(
                "The live interview encountered an error."
              );
            }
          },

          onclose: (event) => {
            console.warn(
              "[Gemini Live] Connection closed:",
              {
                code: event?.code,
                reason: event?.reason,
                wasClean: event?.wasClean,
              }
            );

            stopQueuedAudio();

            candidateSpeakingRef.current = false;
            silenceFramesRef.current = 0;

            setAnswering(false);
            setAiSpeaking(false);

            if (!endingRef.current) {
              setError(
                "The Gemini Live connection was closed."
              );

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

      await startMicrophoneStreaming(
        mediaStream,
        audioContext,
        session
      );

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

      console.log("[Gemini Live] Initial prompt sent");
    } catch (err) {
      console.error(
        "[Interview] Failed to start:",
        err
      );

      endingRef.current = true;

      try {
        session?.close();
      } catch {}

      if (sessionRef.current === session) {
        sessionRef.current = null;
      }

      try {
        if (
          recordingStartedRef.current ||
          uploadIdRef.current
        ) {
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
      throw new Error(
        "No microphone track is available."
      );
    }

    const source = audioContext.createMediaStreamSource(
      new MediaStream(mediaStream.getAudioTracks())
    );

    const processor = audioContext.createScriptProcessor(
      4096,
      1,
      1
    );

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

      const input =
        event.inputBuffer.getChannelData(0);

      let sumSquares = 0;

      for (let i = 0; i < input.length; i++) {
        sumSquares += input[i] * input[i];
      }

      const rms = Math.sqrt(
        sumSquares / input.length
      );

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
          silenceFramesRef.current >=
            SILENCE_FRAMES_TO_STOP
        ) {
          candidateSpeakingRef.current = false;
          silenceFramesRef.current = 0;
          setAnswering(false);
        }
      }

      const pcm16 = floatTo16BitPcm(
        resample(
          input,
          audioContext.sampleRate,
          16000
        )
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
        console.error(
          "[Gemini Live] Microphone send failed:",
          err
        );
      }
    };

    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);
  }

  const toggleMic = () => {
    const next = !micOn;

    streamRef.current?.getAudioTracks().forEach(
      (track) => {
        track.enabled = next;
      }
    );

    setMicOn(next);

    if (!next) {
      candidateSpeakingRef.current = false;
      silenceFramesRef.current = 0;
      setAnswering(false);
    }
  };

  const toggleCamera = () => {
    const next = !camOn;

    streamRef.current?.getVideoTracks().forEach(
      (track) => {
        track.enabled = next;
      }
    );

    setCamOn(next);
  };

  if (stage === "ready") {
    return (
      <>
        <ReadyCheck
          starting={starting}
          onStart={(mediaStream, sharedScreenStream) =>
            startInterview(
              mediaStream,
              sharedScreenStream
            )
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
          <h1 className="text-2xl font-bold">
            Interview ended
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Your interview session has been closed.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Duration: {formatClock(elapsed)}
          </p>

          {error && (
            <p
              role="alert"
              className="mt-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50"
      data-testid="interview-room"
    >
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
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

          <div className="ml-auto flex items-center gap-2">
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

        <div className="border-t border-slate-100 px-4 py-2.5 sm:px-6">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Interview progress</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div
            className="h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Interview time elapsed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
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
          className="mx-auto mt-4 w-full max-w-5xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <main className="mx-auto grid w-full max-w-[1500px] flex-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2 lg:gap-5">
        <CandidateTile
          name={candidateName}
          micOn={micOn}
          camOn={camOn}
          stream={stream}
          answering={answering}
          className="min-h-[280px]"
        />

        <InterviewerTile
          interviewer="AI Interviewer"
          speaking={aiSpeaking}
          caption={captionsOn ? caption : null}
          avatarSize={260}
          stream={null}
          className="min-h-[280px]"
        />

        <section
          className="rounded-xl border border-slate-200 bg-white p-5"
          data-testid="candidate-answer-card"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
              Interview status
            </p>

            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Session active
            </span>
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            {!micOn ? (
              <span className="text-rose-600">
                Your microphone is muted. Unmute to answer.
              </span>
            ) : aiSpeaking ? (
              <>
                <SpeakingDots
                  active
                  className="text-blue-500"
                />
                The AI interviewer is speaking...
              </>
            ) : answering ? (
              <>
                <SpeakingDots
                  active
                  className="text-emerald-500"
                />
                Listening to your answer...
              </>
            ) : (
              "Listen to the interviewer and answer naturally."
            )}
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Take your time. The AI interviewer may ask follow-up questions
            based on your responses.
          </p>
        </section>

        <section
          className={cn(
            "rounded-xl border bg-white p-5 transition-colors",
            aiSpeaking
              ? "border-blue-200"
              : "border-slate-200",
            !captionsOn && "opacity-60"
          )}
          data-testid="current-question-card"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-blue-700">
              <Sparkles className="h-3 w-3" />
              Live captions
            </p>

            <button
              type="button"
              onClick={() =>
                setCaptionsOn((value) => !value)
              }
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
              data-testid="toggle-captions-button"
            >
              {captionsOn
                ? "Hide captions"
                : "Show captions"}
            </button>
          </div>

          <div
            className={cn(
              "mt-3 max-h-48 min-h-[52px] overflow-y-auto whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900",
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

      <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-3 px-4 py-3 sm:justify-between sm:px-6">
          <p className="hidden text-xs text-slate-500 sm:block">
            {micOn ? "Microphone on" : "Microphone off"} ·{" "}
            {camOn ? "Camera on" : "Camera off"}
          </p>

          <div className="flex items-center gap-2.5">
            <ControlButton
              active={micOn}
              onClick={toggleMic}
              label={
                micOn
                  ? "Mute microphone"
                  : "Unmute microphone"
              }
              icon={micOn ? Mic : MicOff}
            />

            <ControlButton
              active={camOn}
              onClick={toggleCamera}
              label={
                camOn
                  ? "Turn camera off"
                  : "Turn camera on"
              }
              icon={camOn ? Video : VideoOff}
            />

            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="ml-1 inline-flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              data-testid="end-interview-button"
            >
              <PhoneOff className="h-4 w-4" />
              <span className="hidden sm:inline">
                End interview
              </span>
            </button>
          </div>

          <p className="hidden w-[150px] text-right text-xs text-slate-400 sm:block">
            AI-guided interview
          </p>
        </div>
      </footer>

      <AlertDialog
        open={confirm}
        onOpenChange={setConfirm}
      >
        <AlertDialogContent data-testid="end-interview-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              End the interview now?
            </AlertDialogTitle>

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
    const nextIndex = Math.min(
      index + 1,
      input.length - 1
    );

    const fraction = i * ratio - index;

    output[i] =
      input[index] * (1 - fraction) +
      input[nextIndex] * fraction;
  }

  return output;
}

function floatTo16BitPcm(input) {
  const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(
      -1,
      Math.min(1, input[i])
    );

    output[i] =
      sample < 0
        ? sample * 32768
        : sample * 32767;
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



