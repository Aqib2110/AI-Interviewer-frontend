import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, LogOut, Settings, User, Building2, Shield } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/common/Avatar";
import { RoleBadge } from "@/components/common/Badges";
import { useSession } from "@/context/SessionContext";
import { ROLES, ROLE_META } from "@/lib/permissions";
import { switchContext,getOrganizations } from "@/services/organization";
import { useAsync } from "@/hooks/useAsync";


export function ContextOptions({ onDone }) {
  const { orgId, switchOrg, switchToIndividual,user,context } = useSession();

    const {data,error,loading} = useAsync(() => getOrganizations(), [orgId]);
    console.log(data,"data");
  const contextSwitch = (membership)=>{
    try {
      if(membership)
      {
      switchOrg(membership);
      switchContext(membership?.organization?.id);
      return;
      }
      switchToIndividual(); 
      switchContext();
    } catch (error) {
      toast.error(error);
    }
  }
  
  const navigate = useNavigate();
  const pick = (fn, label) => { fn(); navigate("/app"); toast.success(`Switched to ${label}`); onDone?.(); };
  return (
    <>
      <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Individual</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => pick(contextSwitch, "your personal account")} data-testid="context-option-individual">
        <User className="mr-2 h-4 w-4 text-slate-500" /> Personal account
        {user?.context === "individual" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Organizations</DropdownMenuLabel>
      {data?.organizations?.map((o) => (
        <DropdownMenuItem key={o?.organization?.id} onClick={() => pick(() => contextSwitch(o), o?.organization?.name)} data-testid={`context-option-${o?.slug}`}>
          <Building2 className="mr-2 h-4 w-4 text-slate-500" />
          <span className="flex-1">{o?.organization?.name}</span>
          <RoleBadge role={o?.role} className="ml-2" />
          {context === "organization" && user.orgId === o?.organization?.id && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function ProfileMenu() {
  const { user, role, context, signOut,orgName } = useSession();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-600" data-testid="profile-menu-trigger">
        <Avatar name={user.name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900" data-testid="profile-menu-name">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="mx-2 mb-2 rounded-md bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
          {context === "individual" ? "Using your personal account" : <span className="flex items-center justify-between">{orgName}<RoleBadge role={role} /></span>}
        </div>
        <DropdownMenuSeparator />
        <ContextOptions />
        {context === "organization" && (
          <>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { signOut(); navigate("/login"); toast("You've been signed out"); }} className="text-rose-600 focus:text-rose-700" data-testid="profile-logout-button">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
