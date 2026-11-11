import { resumes, users, notifications, interviews, candidates } from "@/data";
import { respond, reject } from "./client";
import { scopeInterviews, withCandidate } from "./interviews";
import { apiRequest, tenantRequest } from "./api";

export const resumesService = {
  getCurrent(token) {
    return apiRequest("/api/v1/user/resume",{
      method:"GET"
    },true,token)

  },
  getById(id) {
    return respond(resumes[id] || null);
  },
 upload(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(
    "/api/v1/user/resume/upload",
    {
      method: "POST",
      body: formData,
    },
    true,
    token
  );
}
};

export const notificationsService = {
  list() 
  {
    return tenantRequest("/api/v1/user/notifications",{
      method:"GET"
    })
  },
  markAllRead(notificationIds) {
    return tenantRequest("/api/v1/user/notification",{
      method:"POST",
      body:JSON.stringify({notificationIds})
    })
  }
};

export const searchService = {
  getIndex(scope) {
    const ivs = scopeInterviews(scope).map(withCandidate);
    const candIds = [...new Set(ivs.map((i) => i.candidateId))];
    return respond({
      interviews: ivs.map((i) => ({ id: i.id, title: i.title, candidate: i.candidate.name, role: i.role, status: i.status, score: i.overallScore })),
      candidates: candIds.map((id) => {
        const c = candidates.find((x) => x.id === id);
        return { id: c.id, name: c.name, email: c.email, role: interviews.find((i) => i.candidateId === id)?.role };
      }),
      roles: [...new Set(ivs.map((i) => i.role))],
    }, { latency: 150 });
  },
};
