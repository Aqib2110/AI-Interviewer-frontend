import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Logo } from "@/components/common/Logo";
import { useSession } from "@/context/SessionContext";

function AuthRequired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center" data-testid="auth-required-state">
      <Logo className="mb-10" />
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white"><LockKeyhole className="h-5 w-5 text-slate-600" /></span>
      <h1 className="text-2xl font-semibold text-slate-950">Sign in to continue</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">Your interviews, candidates and reports are private to your account and organization.</p>
      <div className="mt-7 flex gap-2">
        <Button asChild data-testid="auth-required-login-button"><Link to="/login">Log in</Link></Button>
        <Button asChild variant="outline"><Link to="/signup">Create an account</Link></Button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { isAuthenticated, context, org } = useSession();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!isAuthenticated) return <AuthRequired />;
  const fullBleed = pathname.startsWith("/app/interviews") && pathname !== "/app/interviews/new";

  return (
    <div className="min-h-screen bg-[hsl(210_40%_98%)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 bg-white lg:block"><Sidebar /></aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-60">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <motion.main
          key={`${context}-${org?.id}-${pathname.split("/").slice(0, 3).join("/")}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
          className={`mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${fullBleed ? "" : "max-w-[1600px]"}`}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
