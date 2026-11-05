import { candidates, resumes, reports } from "@/data";
import { respond, reject } from "./client";
import { scopeInterviews } from "./interviews";
import { authenticatedRequest, publicRequest, tenantRequest } from "./api";
import { method } from "lodash";

const summarize = (cand, ivs) => {
  const latest = ivs[0];
  return {
    ...cand,
    latestInterview: latest
      ? { id: latest.id, title: latest.title, role: latest.role, status: latest.status, score: latest.overallScore, recommendation: latest.recommendation, date: latest.interviewDate || latest.createdAt, skills: latest.requiredSkills }
      : null,
    interviewCount: ivs.length,
  };
};

export const candidatesService = {
  list() {
   return tenantRequest("/api/v1/organization/candidates",{method:"GET"})
  },
  createCandidate(payload,slug,tenantId){
   return publicRequest("/api/v1/organization/interview/candidate",{
    method:"POST",
    body:JSON.stringify({...payload,slug,tenantId})
   })
  },
  getProfile(id) {
     return tenantRequest(`/api/v1/organization/candidate/${id}`,{
    method:"GET",
   })
  },
};
