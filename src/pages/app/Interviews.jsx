import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MousePointerClick, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewList } from "@/components/interviews/InterviewList";
import { InterviewDetail } from "@/components/interviews/InterviewDetail";
import { EmptyState } from "@/components/common/States";
import { interviewsService } from "@/services";
import { useAsync, useMediaQuery } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

export default function InterviewsPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { orgId,context } = useSession();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const list = useAsync(() => interviewsService.list(context), [orgId]);

  useEffect(() => {
    if (isDesktop && !id && list?.data?.interviews?.length && !params.get("q")) navigate(`/app/interviews/${(list?.data?.interviews?.find((i) => i?.status === "completed") || list?.data?.interviews[0]).slug}`, { replace: true });
  }, [isDesktop, id, list.data]); 

  const createBtn = (
    <Button asChild size="sm" data-testid="empty-create-interview-button"><Link to="/app/interviews/new"><Plus className="mr-1.5 h-4 w-4" />New interview</Link></Button>
  );

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8 lg:-my-8 lg:grid lg:h-[calc(100vh-4rem)] lg:grid-cols-[minmax(290px,20%)_1fr]" data-testid="interviews-page">
      <aside className={cn("border-slate-200 bg-white lg:block lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:border-r", id && "hidden")}>
        <InterviewList
          items={list?.data?.interviews} loading={list?.loading} error={list?.error} reload={list?.reload}
          selectedId={id} onSelect={(x) => navigate(`/app/interviews/${x}`)} initialQuery={params.get("q") || ""} onCreate={createBtn}
        />
      </aside>
      <section className={cn("px-4 py-6 sm:px-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-8 lg:py-7 scrollbar-thin", !id && "hidden lg:block")}>
        {id ? (
          <InterviewDetail  id={id} onBack={() => navigate("/app/interviews")} />
        ) : (
          !list.loading && <EmptyState icon={MousePointerClick} title="Select an interview" description="Choose an interview from the list to review the candidate, scores, transcript and recording." className="mt-10" />
        )}
      </section>
    </div>
  );
}
