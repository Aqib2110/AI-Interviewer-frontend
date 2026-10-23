import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessagesSquare, User, Briefcase, CornerDownLeft, ArrowRight } from "lucide-react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/Badges";
import { ScorePill } from "@/components/common/ScoreRing";
import { Avatar } from "@/components/common/Avatar";
import { searchService } from "@/services";
import { useSession } from "@/context/SessionContext";
import { NAVIGATION } from "@/config/navigation";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const { user, orgId } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e?.key?.toLowerCase() === "k" && (e?.metaKey || e?.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) searchService.getIndex(scope).then(setIndex).catch(() => setIndex({ interviews: [], candidates: [], roles: [] }));
  }, [open, user?.context, orgId]); 

  const go = (to) => { setOpen(false); navigate(to); };
  const pages = NAVIGATION[user?.context];

  return (
    <>
      <button
        type="button" onClick={() => setOpen(true)} data-testid="global-search-trigger"
        className="group flex h-9 w-full max-w-[520px] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-white"
      >
        <Search className="h-4 w-4 text-slate-400" />
        <span className="flex-1 truncate">Search interviews, candidates, roles...</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-slate-500 sm:inline-flex">{isMac ? "⌘" : "Ctrl"} K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search interviews, candidates, roles and pages</DialogDescription>
        <CommandInput placeholder="Search interviews, candidates, roles..." data-testid="global-search-input" />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{index ? "No results. Try a candidate name or role." : "Loading…"}</CommandEmpty>
          {index?.interviews.length > 0 && (
            <CommandGroup heading="Interviews">
              {index.interviews.map((i) => (
                <CommandItem key={i.id} value={`${i.candidate} ${i.title} ${i.role}`} onSelect={() => go(`/app/interviews/${i.id}`)} data-testid={`search-result-interview-${i.id}`}>
                  <MessagesSquare className="text-slate-400" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i.candidate}</p><p className="truncate text-xs text-slate-500">{i.title}</p></div>
                  <StatusBadge status={i.status} className="hidden sm:inline-flex" />
                  <ScorePill score={i.score} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {user?.context === "organization" && index?.candidates.length > 0 && (
            <CommandGroup heading="Candidates">
              {index.candidates.map((c) => (
                <CommandItem key={c.id} value={`${c.name} ${c.email} candidate`} onSelect={() => go(`/app/candidates/${c.id}`)} data-testid={`search-result-candidate-${c.id}`}>
                  <Avatar name={c.name} size="xs" />
                  <span className="flex-1 truncate text-sm">{c.name}</span>
                  <span className="truncate text-xs text-slate-500">{c.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {index?.roles.length > 0 && (
            <CommandGroup heading="Roles">
              {index.roles.map((r) => (
                <CommandItem key={r} value={`role ${r}`} onSelect={() => go(`/app/interviews?q=${encodeURIComponent(r)}`)}>
                  <Briefcase className="text-slate-400" /><span className="flex-1 text-sm">{r}</span><ArrowRight className="text-slate-300" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Go to">
            {pages?.map((p) => (
              <CommandItem key={p.key} value={`page ${p.label}`} onSelect={() => go(p.to)}>
                <p.icon className="text-slate-400" /><span className="text-sm">{p.label}</span>
              </CommandItem>
            ))}
            <CommandItem value="page profile account" onSelect={() => go("/app/settings")}><User className="text-slate-400" /><span className="text-sm">Account settings</span></CommandItem>
          </CommandGroup>
        </CommandList>
        <div className="flex items-center gap-4 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> to open</span>
          <span>↑↓ to navigate</span><span>esc to close</span>
        </div>
      </CommandDialog>
    </>
  );
}
