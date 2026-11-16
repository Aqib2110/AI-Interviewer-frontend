
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessagesSquare,
  Briefcase,
  CornerDownLeft,
  ArrowRight,
} from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/Badges";
import { ScorePill } from "@/components/common/ScoreRing";
import { Avatar } from "@/components/common/Avatar";
import { searchService } from "@/services";
import { useSession } from "@/context/SessionContext";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const { context } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const searchQuery = query.trim();

    if (!open || !searchQuery) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await searchService.search(
          context,
          searchQuery
        );

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query, context, retry]);

  useEffect(() => {
    const onKey = (e) => {
      if (
        e.key?.toLowerCase() === "k" &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (to) => {
    setOpen(false);
    setQuery("");
    setData(null);
    setError(null);
    navigate(to);
  };

  const reload = () => {
    setRetry((prev) => prev + 1);
  };

  const interviews = data?.result?.interviews ?? [];

  const candidates =
    context === "organization"
      ? data?.result?.candidates ?? []
      : [];

  const roles = data?.result?.interviews || [];

  const hasResults =
    interviews.length > 0 ||
    candidates.length > 0 ||
    roles.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="global-search-trigger"
        className="group flex h-9 w-full max-w-[520px] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-white"
      >
        <Search className="h-4 w-4 text-slate-400" />

        <span className="flex-1 truncate">
          Search interviews, candidates, roles...
        </span>

        <kbd className="hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-slate-500 sm:inline-flex">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            setQuery("");
            setData(null);
            setError(null);
          }
        }}
      >
        <DialogTitle className="sr-only">
          Search
        </DialogTitle>

        <DialogDescription className="sr-only">
          Search interviews, candidates, roles...
        </DialogDescription>

        <CommandInput
          placeholder="Search interviews, candidates, roles..."
          value={query}
          onValueChange={setQuery}
          data-testid="global-search-input"
        />

        <CommandList className="max-h-[420px]">
          {!query.trim() ? (
            <CommandEmpty>
              Start typing to search...
            </CommandEmpty>
          ) : loading ? (
            <CommandEmpty>
              Searching...
            </CommandEmpty>
          ) : error ? (
            <CommandEmpty>
              Search failed.{" "}
              <button
                type="button"
                onClick={reload}
                className="font-medium text-blue-600 hover:underline"
              >
                Try again
              </button>
            </CommandEmpty>
          ) : !hasResults ? (
            <CommandEmpty>
              No results. Try another search.
            </CommandEmpty>
          ) : (
            <>
              {interviews.length > 0 && (
                <CommandGroup heading="Interviews">
                  {interviews.map((interview) => (
                    <CommandItem
                      key={interview.id}
                      value={interview.title ?? ""}
                      onSelect={() =>
                        go(`/app/interviews/${interview.slug}`)
                      }
                      data-testid={`search-result-interview-${interview.slug}`}
                    >
                      <MessagesSquare className="text-slate-400" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {interview.title}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {interview.candidateEmail}
                        </p>
                      </div>

                      <StatusBadge
                        status={interview.status}
                        className="hidden sm:inline-flex"
                      />

                      <ScorePill score={interview.score} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {context === "organization" &&
                candidates.length > 0 && (
                  <CommandGroup heading="Candidates">
                    {candidates.map((candidate) => (
                      <CommandItem
                        key={candidate.id}
                        value={candidate.name ?? ""}
                        onSelect={() =>
                          go(`/app/candidates/${candidate.id}`)
                        }
                        data-testid={`search-result-candidate-${candidate.id}`}
                      >
                        <Avatar
                          name={candidate.name}
                          size="xs"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {candidate.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {candidate.email}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {roles.length > 0 && (
                <CommandGroup heading="Roles">
                  {roles.map((role) => (
                    <CommandItem
                      key={role.id}
                      value={role.role}
                      onSelect={() =>
                        go(
                          `/app/interviews/${role.slug}`
                        )
                      }
                    >
                      <Briefcase className="text-slate-400" />

                      <span className="flex-1 text-sm">
                        {role.role}
                      </span>

                      <ArrowRight className="text-slate-300" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>

        <div className="flex items-center gap-4 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            to open
          </span>

          <span>↑↓ to navigate</span>
          <span>esc to close</span>
        </div>
      </CommandDialog>
    </>
  );
}
