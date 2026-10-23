// Frontend-only permission map. Real authorization will live in the backend.
const ORG_MATRIX = {
  "interview:create": ["ADMIN", "HR"],
  "interview:delete": ["ADMIN"],
  "candidate:view": ["ADMIN", "HR", "VIEWER"],
  "candidate:manage": ["ADMIN", "HR"],
  "decision:record": ["ADMIN", "HR"],
  "workspace:create": ["ADMIN", "HR"],
  "members:view": ["ADMIN"],
  "members:manage": ["ADMIN"],
  "invitations:manage": ["ADMIN"],
  "org:settings": ["ADMIN"],
  "org:delete": ["ADMIN"],
};

const ORG_ONLY = ["members:", "invitations:", "org:", "candidate:", "decision:"];

export const ROLES = ["ADMIN", "HR", "VIEWER"];

export const ROLE_META = {
  ADMIN: { label: "Admin", description: "Full access, including members, billing and organization settings.", cls: "bg-slate-900 text-white border-slate-900" },
  HR: { label: "HR", description: "Create interviews, manage candidates and record hiring decisions.", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  VIEWER: { label: "Viewer", description: "Read-only access to interviews, reports and recordings.", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function can(context, role, perm) {
  if (context === "individual") return !ORG_ONLY.some((p) => perm.startsWith(p));
  return (ORG_MATRIX[perm] || []).includes(role);
}
