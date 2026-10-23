import { workspaces, members, invitations, organizations } from "@/data";
import { respond, reject, uid } from "./client";
import { apiRequest, authenticatedRequest, tenantRequest } from "./api";

const hydrate = (ws) => ({
  ...ws,
  organization: organizations.find((o) => o.id === ws.orgId) || null,
  members: ws.memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean),
});


export const getOrganizations = ()=>{
return tenantRequest("/api/v1/user/organizations",{
  method:"GET"
});
}

export const switchContext = (tenantId)=>{
  console.log(tenantId,"tenantIds");
  if(!tenantId)
  {
    return authenticatedRequest("/api/v1/user/context/switch",{
      method:"POST"
    })
  }
return authenticatedRequest("/api/v1/user/context/switch",{
  method:"POST",
  body:JSON.stringify({tenantId})
});
}

export const workspacesService = {
  list({ orgIds = [] } = {}) {
    return respond(workspaces.filter((w) => w.type === "personal" || orgIds.includes(w.orgId)).map(hydrate));
  },
  create({ name, description, type, orgId }) {
    if (!name?.trim()) return reject("Workspace name is required.");
    const ws = { id: uid("ws"), type, orgId: type === "organization" ? orgId : undefined, name, description, memberIds: ["mem_hannah"], interviewCount: 0, createdAt: new Date().toISOString() };
    workspaces.push(ws);
    return respond(hydrate(ws), { latency: 700, mutation: true });
  },
};

export const membersService = {
  list(orgId) {
    return respond(members.filter((m) => m.orgId === orgId));
  },
  updateRole(memberId, role) {
    const m = members.find((x) => x.id === memberId);
    m.role = role;
    return respond(m, { latency: 500, mutation: true });
  },
  setStatus(memberId, status) {
    const m = members.find((x) => x.id === memberId);
    m.status = status;
    return respond(m, { latency: 500, mutation: true });
  },
  remove(memberId) {
    const i = members.findIndex((x) => x.id === memberId);
    members.splice(i, 1);
    return respond(memberId, { latency: 500, mutation: true });
  },
};

export const invitationsService = {
  list(orgId) {
    return respond(invitations.filter((i) => i.orgId === orgId));
  },
  invite({ email, role, orgId }) {
    if (invitations.some((i) => i.email === email && i.status === "pending")) return reject(`${email} already has a pending invitation.`);
    const inv = { id: uid("inv"), orgId, email, role, status: "pending", invitedBy: "Hannah Reyes", sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 864e5).toISOString() };
    invitations.unshift(inv);
    return respond(inv, { latency: 700, mutation: true });
  },
  resend(id) {
    const inv = invitations.find((i) => i.id === id);
    inv.sentAt = new Date().toISOString();
    return respond(inv, { latency: 500, mutation: true });
  },
  revoke(id) {
    const inv = invitations.find((i) => i.id === id);
    inv.status = "revoked";
    return respond(inv, { latency: 500, mutation: true });
  },
};
