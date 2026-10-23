import { cn } from "@/lib/utils";

export const LogoMark = ({ className }) => (
  <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="currentColor" />
    <circle cx="10" cy="10.5" r="2.6" fill="#60A5FA" />
    <path d="M9.5 22.5v-5.5M15.5 22.5V13M21.5 22.5V9.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const Logo = ({ dark = false, className }) => (
  <span className={cn("inline-flex items-center gap-2", className)}>
    <LogoMark className={dark ? "text-white [&_path]:stroke-slate-950" : "text-slate-950"} />
    <span className={cn("font-display text-[19px] font-semibold tracking-tight", dark ? "text-white" : "text-slate-950")}>intervia</span>
  </span>
);
