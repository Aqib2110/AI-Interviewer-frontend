import { publicRequest,tenantRequest } from "./api";
export const candidatesService = {
  list() {
   return tenantRequest("/api/v1/organization/candidates",{method:"GET"})
  },
 createCandidate(payload, slug, tenantId) {
  payload.append("slug", slug);
  payload.append("tenantId", tenantId);
  return publicRequest("/api/v1/organization/interview/candidate", {
    method: "POST",
    body: payload,
  });
},
  getProfile(id) {
     return tenantRequest(`/api/v1/organization/candidate/${id}`,{
    method:"GET",
   })
  },
};
