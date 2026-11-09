
const API_URL = process.env.REACT_APP_BACKEND_API_URL;
const KEY = "intervia.session.v1";

export async function apiRequest(
  endpoint,
  options = {},
  type = "authenticated",
  accessToken=null
) {
  const session = JSON.parse(localStorage.getItem(KEY) || "null");

 const token = accessToken ||
  (type !== "public" ? session?.user?.token : null);
    console.log("session",session,token);

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    ...(type === "tenant" &&
      session?.orgId && {
        "x-tenant-id": session.orgId,
      }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: type === "public" ? "omit" : "include",
  });
  console.log("request reaches");
  const data = await response.json();

  if (
    response.status === 401 &&
    data.message === "Token has expired" &&
    !options._retry &&
    type !== "public"
  ) {
    return tokenRefresh(endpoint, options, type, token);
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

async function tokenRefresh(endpoint, options, type, accessToken) {
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    localStorage.removeItem(KEY);
    window.location.href = "/login";

    throw new Error(
      data?.message || "Session expired. Please log in again."
    );
  }

  const session = JSON.parse(localStorage.getItem(KEY) || "null");

  if (!session) {
    throw new Error("User session not found");
  }

  localStorage.setItem(
    KEY,
    JSON.stringify({
      ...session,
      user: {
        ...session.user,
        token: data.token,
      },
    })
  );

   console.log("Refresh successful:", data.token);

const result = await apiRequest(
  endpoint,
  {
    ...options,
    _retry: true,
  },
  type,
  data.token
);

console.log("Retried request completed:", result);

return result;
}

export const tenantRequest = (endpoint, options = {}) =>
  apiRequest(endpoint, options, "tenant",undefined);

export const authenticatedRequest = (endpoint, options = {}) =>
  apiRequest(endpoint, options, "authenticated",undefined);

export const publicRequest = (endpoint, options = {}) =>
  apiRequest(endpoint, options, "public",undefined);
