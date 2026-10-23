import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/States";
import { InterviewRoom } from "@/components/live/InterviewRoom";
import { useAsync } from "@/hooks/useAsync";
import { interviewsService } from "@/services";
import { CandidateInfoForm } from "@/components/live/CandidateInfo";

export default function LiveInterviewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isPublic = searchParams.get("isPublic") === "true";

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => interviewsService.getPublicInterviewInfo(id),
    [id]
  );

  const interview = data?.report;

  useEffect(() => {
    if (interview?.tenantId && !isPublic) {
      navigate(`/interview/${id}?isPublic=true`, { replace: true });
    }
  }, [interview?.tenantId, id, isPublic, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton className="h-10 w-80" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="aspect-[4/3] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <ErrorState
          error={error}
          onRetry={reload}
          className="w-full max-w-md"
        />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        Interview not found.
      </div>
    );
  }

  if (interview.tenantId && !isPublic) 
  {
    return null;
  }

  if (interview.status === "COMPLETED" || interview.status === "COMPELETED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Interview completed</h1>
          <p className="mt-2 text-slate-600">
            This interview has already been completed.
          </p>
        </div>
      </div>
    );
  }
  if(!interview?.candidate)
    {
     return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
             <CandidateInfoForm />
      </div>
    );
  }

  return (
    <InterviewRoom
      id={id}
      interview={interview}
      isPublic={isPublic}
    />
  );
}
