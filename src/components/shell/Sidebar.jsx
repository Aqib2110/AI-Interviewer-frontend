import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/context/SessionContext";
import { NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";

function NavItem({ item, active, disabled, onNavigate }) {
  const Icon = item.icon;
  const cls = cn(
    "group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] font-medium transition-colors",
    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    disabled && "cursor-not-allowed text-slate-400 hover:bg-transparent hover:text-slate-400"
  );
  if (disabled)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cls} data-testid={`nav-${item.key}-link`} aria-disabled="true">
            <Icon className="h-4 w-4" />{item.label}<Lock className="ml-auto h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">Requires ADMIN or HR role</TooltipContent>
      </Tooltip>
    );
  return (
    <Link to={item.to} onClick={onNavigate} className={cls} data-testid={`nav-${item.key}-link`}>
      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ onNavigate }) { 
  const { pathname } = useLocation();
  const { user, org, context, can,role } = useSession();
  const sections = NAVIGATION[context];
  console.log(sections);
  const isActive = (item) => (item.match ? item.match(pathname) : pathname.startsWith(item.to));

  return (
    <div className="flex h-full flex-col" data-testid="app-sidebar">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link to="/app" onClick={onNavigate} data-testid="sidebar-logo-link"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-thin">
        {sections?.map((sec) => {
          const items = sec.items.filter((i) => i?.roles ? can(i?.roles) : i);
           console.log(items,"items");
          if (!items.length) return null;

          return (
            <div key={sec?.section}>
              <p className="mb-2 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-400">{sec.section}</p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavItem key={item.key} item={item} active={isActive(item)} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="m-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5" data-testid="sidebar-usage-card">
        {user?.context === "organization" && org ? (
          <>
            <div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-800">{org?.plan} plan</span><span className="text-slate-500">{org?.seatsUsed}/{org?.seats} seats</span></div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-900" style={{ width: `${(org?.seatsUsed / org?.seats) * 100}%` }} /></div>
            <p className="mt-2 text-[11px] text-slate-500">38 of 120 interviews used this month</p>
          </>
        ) : (
          <>
          </>
        )}
      </div>
    </div>
  );
}
