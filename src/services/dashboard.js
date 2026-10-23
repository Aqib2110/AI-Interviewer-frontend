import { reports, candidates, resumes, users } from "@/data";
import { respond } from "./client";
import { scopeInterviews, withCandidate } from "./interviews";
import { apiRequest, authenticatedRequest, tenantRequest } from "./api";

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

const stats = (ivs) => {
  const done = ivs.filter((i) => i.status === "completed");
  return {
    total: ivs.length,
    completed: done.length,
    pending: ivs.filter((i) => i.status === "pending" || i.status === "in_progress").length,
    averageScore: avg(done.map((i) => i.overallScore)),
  };
};

const weeklyTrend = [
  { week: "Aug 24", interviews: 4, avgScore: 71 }, { week: "Aug 31", interviews: 6, avgScore: 74 },
  { week: "Sep 7", interviews: 5, avgScore: 69 }, { week: "Sep 14", interviews: 8, avgScore: 76 },
  { week: "Sep 21", interviews: 7, avgScore: 72 }, { week: "Sep 28", interviews: 9, avgScore: 78 },
  { week: "Oct 5", interviews: 11, avgScore: 80 },
];

export const dashboardService = {
  getOrgOverview(orgId) {
       console.log(orgId,"orgId and token");

    return tenantRequest(`/api/v1/organization/${orgId}/dashboard/overview`,{
    method:"GET",
   });
  },
  getIndividualOverview() {
   return authenticatedRequest("/api/v1/user/dashboard/overview",{
    method:"GET"
   });
  },
};
