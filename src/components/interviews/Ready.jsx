// import { useEffect, useRef, useState } from "react";
// import {
//   Camera,
//   CameraOff,
//   CheckCircle2,
//   Mic,
//   MicOff,
//   Volume2,
//   AlertCircle,
// } from "lucide-react";

// export function ReadyCheck({ onStart, starting = false }) {
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const animationRef = useRef(null);

//   const [stream, setStream] = useState(null);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [micReady, setMicReady] = useState(false);
//   const [micLevel, setMicLevel] = useState(0);
//   const [speakerTested, setSpeakerTested] = useState(false);
//   const [error, setError] = useState("");

//   async function enableDevices() {
//     if (streamRef.current) return;

//     setError("");

//     try {
//       const media = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });

//       streamRef.current = media;
//       setStream(media);

//       setCameraReady(
//         media.getVideoTracks().some((track) => track.readyState === "live")
//       );

//       setMicReady(
//         media.getAudioTracks().some((track) => track.readyState === "live")
//       );

//       if (videoRef.current) {
//         videoRef.current.srcObject = media;
//         await videoRef.current.play().catch(() => {});
//       }

//       const AudioContextClass =
//         window.AudioContext || window?.webkitAudioContext;

//       const audioContext = new AudioContextClass();
//       audioContextRef.current = audioContext;
//       await audioContext.resume();

//       const source = audioContext.createMediaStreamSource(media);
//       const analyser = audioContext.createAnalyser();

//       analyser.fftSize = 512;
//       source.connect(analyser);

//       const samples = new Uint8Array(analyser.frequencyBinCount);

//       const measure = () => {
//         analyser.getByteTimeDomainData(samples);

//         let sum = 0;

//         for (const sample of samples) {
//           const value = (sample - 128) / 128;
//           sum += value * value;
//         }

//         const level = Math.min(
//           100,
//           Math.round(Math.sqrt(sum / samples.length) * 250)
//         );

//         setMicLevel(level);
//         animationRef.current = requestAnimationFrame(measure);
//       };

//       measure();
//     } catch (err) {
//       console.error("Device setup failed:", err);

//       setError(
//         err.name === "NotAllowedError"
//           ? "Allow camera and microphone access in your browser settings."
//           : "Could not access your camera or microphone. Check your devices and try again."
//       );
//     }
//   }

//   async function testSpeaker() {
//     try {
//       const AudioContextClass =
//         window.AudioContext || window.webkitAudioContext;

//       const context =
//         audioContextRef.current || new AudioContextClass();

//       audioContextRef.current = context;

//       await context.resume();

//       const oscillator = context.createOscillator();
//       const gain = context.createGain();

//       oscillator.type = "sine";
//       oscillator.frequency.value = 660;
//       gain.gain.value = 0.12;

//       oscillator.connect(gain);
//       gain.connect(context.destination);

//       oscillator.start();
//       oscillator.stop(context.currentTime + 0.35);

//       setSpeakerTested(true);
//     } catch (err) {
//       console.error("Speaker test failed:", err);
//       setError("Could not play the test sound. Check your browser audio settings.");
//     }
//   }

//   useEffect(() => {
//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }

//       audioContextRef.current?.close().catch(() => {});
//     };
//   }, []);

//   const canStart =
//     cameraReady && micReady && stream && !starting;

//   return (
//     <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
//       <div className="mx-auto max-w-4xl">
//         <div className="mb-8 text-center">
//           <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
//             Intervia · Pre-interview check
//           </p>

//           <h1 className="mt-3 text-3xl font-bold tracking-tight">
//             Ready for your interview?
//           </h1>

//           <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
//             Check your camera, microphone, and speakers before joining the live AI interviewer.
//           </p>
//         </div>

//         <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
//           <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="relative aspect-video bg-slate-900">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 muted
//                 playsInline
//                 className="h-full w-full object-cover"
//               />

//               {!cameraReady && (
//                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
//                   <Camera size={36} />
//                   <span className="text-sm">
//                     Camera preview appears here
//                   </span>
//                 </div>
//               )}

//               {cameraReady && (
//                 <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
//                   <span className="h-2 w-2 rounded-full bg-emerald-400" />
//                   Camera preview
//                 </span>
//               )}
//             </div>

//             <div className="p-4">
//               <button
//                 type="button"
//                 onClick={enableDevices}
//                 disabled={Boolean(stream) || starting}
//                 className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
//               >
//                 {stream ? (
//                   <CheckCircle2 size={18} />
//                 ) : (
//                   <Camera size={18} />
//                 )}

//                 {stream
//                   ? "Camera and microphone enabled"
//                   : "Enable camera and microphone"}
//               </button>
//             </div>
//           </section>

//           <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <DeviceStatus
//               icon={cameraReady ? Camera : CameraOff}
//               title="Camera"
//               description={
//                 cameraReady
//                   ? "Camera stream is active."
//                   : "Enable camera access to continue."
//               }
//               ready={cameraReady}
//             />

//             <div className="border-t border-slate-100 pt-4">
//               <DeviceStatus
//                 icon={micReady ? Mic : MicOff}
//                 title="Microphone"
//                 description={
//                   micReady
//                     ? "Speak to check your input level."
//                     : "Microphone access is not enabled."
//                 }
//                 ready={micReady}
//               />

//               <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
//                 <div
//                   className="h-full rounded-full bg-emerald-500 transition-[width] duration-100"
//                   style={{ width: `${micLevel}%` }}
//                 />
//               </div>

//               <p className="mt-1 text-xs text-slate-500">
//                 {micLevel > 5
//                   ? "Microphone input detected"
//                   : "Say a few words"}
//               </p>
//             </div>

//             <div className="border-t border-slate-100 pt-4">
//               <DeviceStatus
//                 icon={Volume2}
//                 title="Speaker"
//                 description="Play a test sound and confirm you can hear it."
//                 ready={speakerTested}
//               />

//               <button
//                 type="button"
//                 onClick={testSpeaker}
//                 className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
//               >
//                 Test speaker
//               </button>

//               {speakerTested && (
//                 <p className="mt-2 text-xs text-slate-600">
//                   If you didn't hear the tone, check your device volume.
//                 </p>
//               )}
//             </div>
//           </section>
//         </div>

//         {error && (
//           <div
//             role="alert"
//             className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
//           >
//             <AlertCircle size={18} className="mt-0.5 shrink-0" />
//             {error}
//           </div>
//         )}

//         <div className="mt-6 flex flex-col items-center gap-3">
//           <button
//             type="button"
//             disabled={!canStart}
//             onClick={() => onStart(stream)}
//             className="inline-flex min-w-56 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {starting ? "Connecting to interviewer..." : "Start interview"}
//           </button>

//           <p className="text-center text-xs text-slate-500">
//             Your interview session starts only after you click Start Interview.
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

// function DeviceStatus({ icon: Icon, title, description, ready }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div
//         className={`rounded-lg p-2 ${
//           ready
//             ? "bg-emerald-50 text-emerald-600"
//             : "bg-slate-100 text-slate-500"
//         }`}
//       >
//         <Icon size={20} />
//       </div>

//       <div className="min-w-0 flex-1">
//         <div className="flex items-center justify-between gap-2">
//           <p className="text-sm font-semibold">{title}</p>

//           <span
//             className={`text-xs font-medium ${
//               ready ? "text-emerald-600" : "text-slate-500"
//             }`}
//           >
//             {ready ? "Ready" : "Not checked"}
//           </span>
//         </div>

//         <p className="mt-1 text-xs leading-5 text-slate-500">
//           {description}
//         </p>
//       </div>
//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  Monitor,
  MonitorCheck,
  AlertCircle,
} from "lucide-react";

export function ReadyCheck({
  onStart,
  starting = false,
  onScreenShareChange,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const transferredRef = useRef(false);
  const startingRef = useRef(false);

  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [screenReady, setScreenReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [error, setError] = useState("");

  async function enableDevices() {
    if (streamRef.current) return;

    setError("");

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = media;
      setStream(media);

      const hasCamera = media.getVideoTracks().some(
        (track) => track.readyState === "live"
      );

      const hasMicrophone = media.getAudioTracks().some(
        (track) => track.readyState === "live"
      );

      setCameraReady(hasCamera);
      setMicReady(hasMicrophone);

      if (videoRef.current && hasCamera) {
        videoRef.current.srcObject = media;
        await videoRef.current.play().catch(() => {});
      }

      if (!hasCamera || !hasMicrophone) {
        throw new Error(
          "An active camera and microphone are required."
        );
      }

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(media);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      source.connect(analyser);

      const samples = new Uint8Array(analyser.frequencyBinCount);

      const measure = () => {
        if (
          audioContext.state === "closed" ||
          transferredRef.current
        ) {
          return;
        }

        analyser.getByteTimeDomainData(samples);

        let sum = 0;

        for (const sample of samples) {
          const value = (sample - 128) / 128;
          sum += value * value;
        }

        const level = Math.min(
          100,
          Math.round(
            Math.sqrt(sum / samples.length) * 250
          )
        );

        setMicLevel(level);
        animationRef.current = requestAnimationFrame(measure);
      };

      measure();
    } catch (err) {
      console.error("Device setup failed:", err);

      setError(
        err.message ||
          (err.name === "NotAllowedError"
            ? "Allow camera and microphone access in your browser settings."
            : "Could not access your camera or microphone.")
      );
    }
  }

  async function enableScreenShare() {
    if (screenStreamRef.current) {
      const existingTrack =
        screenStreamRef.current.getVideoTracks()[0];

      if (existingTrack?.readyState === "live") {
        return screenStreamRef.current;
      }

      screenStreamRef.current = null;
    }

    setError("");

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const videoTrack = screen.getVideoTracks()[0];

      if (!videoTrack || videoTrack.readyState !== "live") {
        screen.getTracks().forEach((track) => track.stop());
        throw new Error("No active screen video track was found.");
      }

      screenStreamRef.current = screen;

      setScreenStream(screen);
      setScreenReady(true);

      onScreenShareChange?.(true, screen);

      videoTrack.addEventListener(
        "ended",
        () => {
          screenStreamRef.current = null;

          setScreenStream(null);
          setScreenReady(false);

          onScreenShareChange?.(false, null);
        },
        { once: true }
      );

      return screen;
    } catch (err) {
      console.error("Screen sharing failed:", err);

      setError(
        err.name === "NotAllowedError"
          ? "Screen sharing was cancelled. Allow screen sharing to continue."
          : err.message || "Could not start screen sharing."
      );

      throw err;
    }
  }

  async function testSpeaker() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const context =
        audioContextRef.current || new AudioContextClass();

      audioContextRef.current = context;

      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 660;
      gain.gain.value = 0.12;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);

      setSpeakerTested(true);
    } catch (err) {
      console.error("Speaker test failed:", err);
      setError("Could not play the test sound. Check your audio settings.");
    }
  }

  async function handleStart() {
    if (
      !streamRef.current ||
      !cameraReady ||
      !micReady ||
      starting ||
      startingRef.current
    ) {
      return;
    }

    startingRef.current = true;
    setError("");

    try {
      const screen = await enableScreenShare();

      const cameraTracks = streamRef.current.getVideoTracks();
      const microphoneTracks = streamRef.current.getAudioTracks();
      const screenTracks = screen.getVideoTracks();

      if (
        !cameraTracks.some((track) => track.readyState === "live") ||
        !microphoneTracks.some((track) => track.readyState === "live") ||
        !screenTracks.some((track) => track.readyState === "live")
      ) {
        throw new Error(
          "Your camera, microphone, or screen sharing stopped. Please try again."
        );
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      transferredRef.current = true;

      await onStart(streamRef.current, screen);
    } catch (err) {
      transferredRef.current = false;

      console.error("Could not start interview:", err);

      setError(
        err.message || "Could not start the interview. Please try again."
      );
    } finally {
      startingRef.current = false;
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      audioContextRef.current?.close().catch(() => {});

      if (!transferredRef.current) {
        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });

        screenStreamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const canStart =
    cameraReady &&
    micReady &&
    Boolean(stream) &&
    !starting;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Intervia · Pre-interview check
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Ready for your interview?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Check your camera, microphone, speakers, and screen sharing before joining the live AI interviewer.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-video bg-slate-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  <Camera size={36} />
                  <span className="text-sm">
                    Camera preview appears here
                  </span>
                </div>
              )}

              {cameraReady && (
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Camera preview
                </span>
              )}
            </div>

            <div className="p-4">
              <button
                type="button"
                onClick={enableDevices}
                disabled={Boolean(stream) || starting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                {stream ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Camera size={18} />
                )}

                {stream
                  ? "Camera and microphone enabled"
                  : "Enable camera and microphone"}
              </button>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <DeviceStatus
              icon={cameraReady ? Camera : CameraOff}
              title="Camera"
              description={
                cameraReady
                  ? "Camera stream is active."
                  : "Enable camera access."
              }
              ready={cameraReady}
            />

            <div className="border-t border-slate-100 pt-4">
              <DeviceStatus
                icon={micReady ? Mic : MicOff}
                title="Microphone"
                description={
                  micReady
                    ? "Speak to check your input level."
                    : "Enable microphone access."
                }
                ready={micReady}
              />

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-100"
                  style={{ width: `${micLevel}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {micLevel > 5
                  ? "Microphone input detected"
                  : "Say a few words"}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <DeviceStatus
                icon={Volume2}
                title="Speaker"
                description="Play a test sound and confirm you can hear it."
                ready={speakerTested}
              />

              <button
                type="button"
                onClick={testSpeaker}
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Test speaker
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <DeviceStatus
                icon={screenReady ? MonitorCheck : Monitor}
                title="Screen sharing"
                description={
                  screenReady
                    ? `Screen sharing is active. ${
                        screenStream?.getAudioTracks().length
                          ? "Screen audio available."
                          : "No screen audio track selected."
                      }`
                    : "Your browser will ask you to select a screen when you start."
                }
                ready={screenReady}
              />
            </div>
          </section>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="inline-flex min-w-56 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting
              ? "Connecting to interviewer..."
              : "Start interview"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Screen sharing starts after you click Start Interview.
          </p>
        </div>
      </div>
    </main>
  );
}

function DeviceStatus({ icon: Icon, title, description, ready }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`rounded-lg p-2 ${
          ready
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{title}</p>

          <span
            className={`text-xs font-medium ${
              ready ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {ready ? "Ready" : "Not checked"}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

