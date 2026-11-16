import { resumes, users, notifications, interviews, candidates } from "@/data";
import { respond, reject } from "./client";
import { scopeInterviews, withCandidate } from "./interviews";
import { apiRequest, authenticatedRequest, tenantRequest } from "./api";
import { method } from "lodash";

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
 search(context,query)
 {
  if(context == "individual")
  {
    return authenticatedRequest(`/api/v1/user/search?q=${query}`,{
      method:"GET"
    })
  }
   return tenantRequest(`/api/v1/organization/search?q=${query}`,{
      method:"GET"
    })
 }
};
