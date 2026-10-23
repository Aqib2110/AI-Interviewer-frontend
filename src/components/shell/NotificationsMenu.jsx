import { useNavigate } from "react-router-dom";
import { Bell, FileCheck2, PlayCircle, UserPlus, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ICONS = { report_ready: FileCheck2, interview_started: PlayCircle, invite_accepted: UserPlus, link_expired: Clock };

export function NotificationsMenu() {
  const { data, loading, setData } = useAsync(() => notificationsService.list(), []);
  const navigate = useNavigate();
  const unread = data?.filter((n) => !n.read).length || 0;
  const markAll = () => notificationsService.markAllRead().then(setData);

  return (
    <Popover>
      <PopoverTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" data-testid="notifications-trigger" aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9.5px] font-semibold text-white" data-testid="notifications-unread-count">{unread}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button className="text-xs font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline" onClick={markAll} disabled={!unread} data-testid="notifications-mark-all-read">Mark all as read</button>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {loading && <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
          {data?.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button key={n.id} onClick={() => n.interviewId && navigate(`/app/interviews/${n.interviewId}`)} className={cn("flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50", !n.read && "bg-blue-50/40")} data-testid={`notification-item-${n.id}`}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600"><Icon className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-slate-900">{n.title}</span>
                  <span className="block truncate text-xs text-slate-500">{n.body}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">{n.createdAt}</span>
                </span>
                {!n.read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
              </button>
            );
          })}
          {data?.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-500">You're all caught up.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
