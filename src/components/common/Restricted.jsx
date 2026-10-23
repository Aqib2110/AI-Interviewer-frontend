import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { RoleBadge } from "./Badges";

export function Restricted({ perm, children, title = "You don't have access to this page" }) {
  const { role, context } = useSession();
  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center" data-testid="restricted-state">
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Lock className="h-5 w-5" /></span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        {context === "individual" ? "This area is only available inside an organization." : <>Your current role <RoleBadge role={role} className="mx-1" /> can't open this page. Ask an organization admin for access.</>}
      </p>
      <Button asChild variant="outline" className="mt-6"><Link to="/app" data-testid="restricted-back-button">Back to overview</Link></Button>
    </div>
  );
}
