export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export const formatDate = (iso, opts = { month: "short", day: "numeric", year: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("en-US", opts) : "—";

export const formatShortDate = (iso) => formatDate(iso, { month: "short", day: "numeric" });

export const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

export const formatClock = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const scoreTone = (score) => {
  if (score == null) return { text: "text-slate-400", bar: "bg-slate-300", stroke: "#CBD5E1", soft: "bg-slate-100" };
  if (score >= 85) return { text: "text-emerald-600", bar: "bg-emerald-500", stroke: "#10B981", soft: "bg-emerald-50" };
  if (score >= 70) return { text: "text-blue-600", bar: "bg-blue-600", stroke: "#2563EB", soft: "bg-blue-50" };
  if (score >= 55) return { text: "text-amber-600", bar: "bg-amber-500", stroke: "#F59E0B", soft: "bg-amber-50" };
  return { text: "text-rose-600", bar: "bg-rose-500", stroke: "#F43F5E", soft: "bg-rose-50" };
};

export const STATUS = {
  completed: { label: "Completed", dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_progress: { label: "In progress", dot: "bg-blue-500 animate-pulse", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Pending", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  expired: { label: "Expired", dot: "bg-slate-400", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const RECOMMENDATION = {
  strong_hire: { label: "Strong Candidate", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  hire: { label: "Recommended", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  consider: { label: "Consider", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  no_hire: { label: "Not Recommended", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const DIMENSIONS = [
  { key: "technical", label: "Technical Skills" },
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "systemDesign", label: "System Design" },
];

export const slug = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
