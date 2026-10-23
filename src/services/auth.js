import { apiRequest, authenticatedRequest, publicRequest } from "./api";

export const authService = {
  login({ email, password }) {
    return authenticatedRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signupIndividual({ name, email, password }) {
    return publicRequest("/api/v1/auth/user/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  signupOrganization({ name, email, password, organizationName }) {
    return publicRequest("/api/v1/auth/organization/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        orgName:organizationName,
      }),
    });
  },

  logout() {
    return apiRequest("/api/v1/auth/logout", {
      method: "POST",
    });
  },
};