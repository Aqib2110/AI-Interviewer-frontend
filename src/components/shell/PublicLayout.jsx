import { Link, Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[hsl(210_40%_98%)]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="Go to homepage"
            className="shrink-0"
          >
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            {/* <span className="hidden text-sm text-slate-500 sm:inline">
              Shared Interview Report
            </span> */}

            <Button asChild variant="outline" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>

    </div>
  );
}