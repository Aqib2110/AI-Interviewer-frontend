import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const TONES = [
  "bg-blue-100 text-blue-800", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800", "bg-slate-200 text-slate-800", "bg-indigo-100 text-indigo-800", "bg-teal-100 text-teal-800",
];
const SIZES = { xs: "h-6 w-6 text-[10px]", sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg", xl: "h-20 w-20 text-2xl" };

export const toneFor = (name = "") => TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

export function Avatar({ name, size = "md", className }) {
  return (
    <span className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold font-display", SIZES[size], toneFor(name), className)} aria-label={name}>
      {initials(name)}
    </span>
  );
}
