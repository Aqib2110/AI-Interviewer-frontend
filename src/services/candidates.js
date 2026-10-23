import { candidates, resumes, reports } from "@/data";
import { respond, reject } from "./client";
import { scopeInterviews } from "./interviews";
import { tenantRequest } from "./api";

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
  getProfile(id, scope) {
    const cand = candidates.find((c) => c.id === id);
    if (!cand) return reject("Candidate not found.");
    const ivs = scopeInterviews(scope).filter((i) => i.candidateId === id);
    const evaluated = ivs.find((i) => reports[i.id]);
    return respond({
      candidate: summarize(cand, ivs),
      interviews: ivs,
      resume: resumes[cand.resumeId] || null,
      latestReport: evaluated ? { interviewId: evaluated.id, role: evaluated.role, score: evaluated.overallScore, ...reports[evaluated.id] } : null,
    });
  },
};
