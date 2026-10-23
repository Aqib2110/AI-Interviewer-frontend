import { Menu, ChevronsUpDown, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommandSearch } from "./CommandSearch";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu, ContextOptions } from "./ProfileMenu";
import { useSession } from "@/context/SessionContext";
import { ROLES, ROLE_META } from "@/lib/permissions";

function ContextSwitcher() {
  const { context, org, role } = useSession();
  const isOrg = context === "organization";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 max-w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-white pl-1.5 pr-2 text-left transition-colors hover:border-slate-300" data-testid="context-switcher-dropdown">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
          {isOrg ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-slate-900" data-testid="current-context-name">{isOrg ? org?.name : "Personal"}</span>
          <span className="block truncate text-[10.5px] text-slate-500">{isOrg ? `Organization · ${role}` : "Individual"}</span>
        </span>
        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72"><ContextOptions /></DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useSession();
  return (
    <Select value={role} onValueChange={(r) => { setRole(r); toast(`Previewing as ${r}`, { description: ROLE_META[r].description }); }}>
      <SelectTrigger className="hidden h-9 w-auto gap-2 border-dashed border-slate-300 bg-white text-xs xl:flex" data-testid="role-switcher-select">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Demo role</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {ROLES.map((r) => <SelectItem key={r} value={r} data-testid={`role-option-${r.toLowerCase()}`}><span className="font-mono text-xs font-medium">{r}</span></SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function Header({ onOpenMenu }) {
  const { context } = useSession();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
      <button onClick={onOpenMenu} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" data-testid="mobile-menu-button" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden sm:block"><ContextSwitcher /></div>
      <div className="flex min-w-0 flex-1 justify-center md:justify-start md:pl-3"><CommandSearch /></div>
      <div className="flex items-center gap-1.5">
        {context === "organization" && <RoleSwitcher />}
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
