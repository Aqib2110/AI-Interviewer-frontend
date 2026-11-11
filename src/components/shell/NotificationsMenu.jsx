
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ShieldCheck,
  UserPlus,
  Video,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { notificationsService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NOTIFICATION_CONFIG = {
  ROLE_UPDATE: {
    icon: ShieldCheck,
    label: "Role Update",
    color: "text-purple-600",
    background: "bg-purple-50",
  },
  INVITATION: {
    icon: UserPlus,
    label: "Invitation",
    color: "text-blue-600",
    background: "bg-blue-50",
  },
  INTERVIEW: {
    icon: Video,
    label: "Interview",
    color: "text-emerald-600",
    background: "bg-emerald-50",
  },
}


export function NotificationsMenu() {
  const navigate = useNavigate();

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => notificationsService.list(),
    []
  );

  const notifications = data?.notifications ?? [];
  const unread = notifications?.length;

  const markAll = async () => {
    if (!notifications?.length) return;

    const notificationIds = notifications.map(
      (notification) => notification.id
    );

    await notificationsService.markAllRead(notificationIds);
    await reload();
  };



  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        data-testid="notifications-trigger"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />

        {unread > 0 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9.5px] font-semibold text-white"
            data-testid="notifications-unread-count"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-slate-500">
              {unread} unread notifications
            </p>
          </div>

          <button
            className="text-xs font-medium text-blue-600 hover:underline disabled:text-slate-400"
            onClick={markAll}
            disabled={!unread}
            data-testid="notifications-mark-all-read"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {loading && (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          )}

          {error && (
            <p className="px-4 py-6 text-center text-sm text-red-500">
              Failed to load notifications.
            </p>
          )}

          {!loading && !error && notifications?.map((notification) => {
            const config =
              NOTIFICATION_CONFIG[notification.type] ?? {
                icon: Bell,
                label: "Notification",
                color: "text-slate-600",
                background: "bg-slate-50",
              };

            const Icon = config.icon;

            return (
              <button
                key={notification.id}
                className={cn(
                  "flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50"
                )}
                data-testid={`notification-item-${notification.id}`}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    config.background,
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-slate-900">
                    {config.label}
                  </span>

                  <span className="block text-xs text-slate-500">
                    {notification.message}
                  </span>

                  <span className="mt-1 block text-[11px] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </span>

                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              </button>
            );
          })}

          {!loading && !error && notifications.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              You're all caught up.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
