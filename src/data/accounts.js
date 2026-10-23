// Dummy data: users, organizations, workspaces, members, invitations, notifications.

export const users = {
  usr_hreyes: {
    id: "usr_hreyes",
    name: "Hannah Reyes",
    email: "hannah.reyes@northwindlabs.io",
    title: "Engineering Manager",
    location: "Toronto, Canada",
    timezone: "America/Toronto (GMT-4)",
    phone: "+1 (416) 555-0142",
    candidateId: "cand_hannah",
    personalWorkspaceId: "ws_personal",
    memberships: [
      { orgId: "org_northwind", role: "ADMIN" },
      { orgId: "org_halcyon", role: "HR" },
      { orgId: "org_ferro", role: "VIEWER" },
    ],
  },
};

export const organizations = [
  { id: "org_northwind", name: "Northwind Labs", slug: "northwind", plan: "Growth", seats: 25, seatsUsed: 9, domain: "northwindlabs.io", industry: "Developer tools", size: "51–200" },
  { id: "org_halcyon", name: "Halcyon Health", slug: "halcyon", plan: "Starter", seats: 10, seatsUsed: 6, domain: "halcyonhealth.com", industry: "Healthcare software", size: "11–50" },
  { id: "org_ferro", name: "Ferro Systems", slug: "ferro", plan: "Enterprise", seats: 100, seatsUsed: 62, domain: "ferro.systems", industry: "Industrial IoT", size: "201–500" },
];

export const workspaces = [
  { id: "ws_personal", type: "personal", name: "Personal", description: "Your private practice interviews and results.", ownerId: "usr_hreyes", memberIds: ["mem_hannah"], interviewCount: 3, createdAt: "2026-06-12" },
  { id: "ws_platform", type: "organization", orgId: "org_northwind", name: "Platform Engineering", description: "Backend, infrastructure and SRE hiring.", memberIds: ["mem_hannah", "mem_daniel", "mem_mei", "mem_rafael"], interviewCount: 6, createdAt: "2026-03-02" },
  { id: "ws_product", type: "organization", orgId: "org_northwind", name: "Product & Frontend", description: "Frontend, full stack and product engineering roles.", memberIds: ["mem_hannah", "mem_aisha", "mem_grace"], interviewCount: 4, createdAt: "2026-03-19" },
  { id: "ws_data", type: "organization", orgId: "org_northwind", name: "Data & ML", description: "Data engineering and machine learning.", memberIds: ["mem_mei", "mem_tom"], interviewCount: 2, createdAt: "2026-05-08" },
  { id: "ws_clinical", type: "organization", orgId: "org_halcyon", name: "Clinical Apps", description: "Patient-facing product teams.", memberIds: ["mem_hannah"], interviewCount: 0, createdAt: "2026-07-21" },
  { id: "ws_embedded", type: "organization", orgId: "org_ferro", name: "Embedded Firmware", description: "Device and firmware engineering.", memberIds: ["mem_hannah"], interviewCount: 0, createdAt: "2026-08-03" },
];

export const members = [
  { id: "mem_hannah", orgId: "org_northwind", name: "Hannah Reyes", email: "hannah.reyes@northwindlabs.io", role: "ADMIN", status: "active", joinedAt: "2026-02-14", lastActive: "Just now" },
  { id: "mem_aisha", orgId: "org_northwind", name: "Aisha Bello", email: "aisha.bello@northwindlabs.io", role: "ADMIN", status: "active", joinedAt: "2026-02-14", lastActive: "2 hours ago" },
  { id: "mem_daniel", orgId: "org_northwind", name: "Daniel Osei", email: "daniel.osei@northwindlabs.io", role: "HR", status: "active", joinedAt: "2026-03-01", lastActive: "Yesterday" },
  { id: "mem_mei", orgId: "org_northwind", name: "Mei Lin", email: "mei.lin@northwindlabs.io", role: "HR", status: "active", joinedAt: "2026-03-09", lastActive: "3 days ago" },
  { id: "mem_grace", orgId: "org_northwind", name: "Grace Liu", email: "grace.liu@northwindlabs.io", role: "HR", status: "active", joinedAt: "2026-05-22", lastActive: "1 hour ago" },
  { id: "mem_rafael", orgId: "org_northwind", name: "Rafael Costa", email: "rafael.costa@northwindlabs.io", role: "VIEWER", status: "active", joinedAt: "2026-06-04", lastActive: "Last week" },
  { id: "mem_tom", orgId: "org_northwind", name: "Tom Becker", email: "tom.becker@northwindlabs.io", role: "VIEWER", status: "active", joinedAt: "2026-07-17", lastActive: "4 days ago" },
  { id: "mem_ines", orgId: "org_northwind", name: "Inês Duarte", email: "ines.duarte@northwindlabs.io", role: "VIEWER", status: "deactivated", joinedAt: "2026-04-11", lastActive: "Aug 30" },
  { id: "mem_kofi", orgId: "org_northwind", name: "Kofi Mensah", email: "kofi.mensah@northwindlabs.io", role: "HR", status: "active", joinedAt: "2026-09-02", lastActive: "Today" },
];

export const invitations = [
  { id: "inv_301", orgId: "org_northwind", email: "j.park@northwindlabs.io", role: "HR", status: "pending", invitedBy: "Hannah Reyes", sentAt: "2026-10-06", expiresAt: "2026-10-13" },
  { id: "inv_302", orgId: "org_northwind", email: "oliver.grant@northwindlabs.io", role: "VIEWER", status: "pending", invitedBy: "Aisha Bello", sentAt: "2026-10-04", expiresAt: "2026-10-11" },
  { id: "inv_303", orgId: "org_northwind", email: "sofia.marin@northwindlabs.io", role: "ADMIN", status: "pending", invitedBy: "Hannah Reyes", sentAt: "2026-10-01", expiresAt: "2026-10-08" },
  { id: "inv_298", orgId: "org_northwind", email: "kofi.mensah@northwindlabs.io", role: "HR", status: "accepted", invitedBy: "Hannah Reyes", sentAt: "2026-08-30", respondedAt: "2026-09-02" },
  { id: "inv_294", orgId: "org_northwind", email: "tom.becker@northwindlabs.io", role: "VIEWER", status: "accepted", invitedBy: "Mei Lin", sentAt: "2026-07-15", respondedAt: "2026-07-17" },
  { id: "inv_290", orgId: "org_northwind", email: "r.alvarez@contractor.dev", role: "VIEWER", status: "expired", invitedBy: "Daniel Osei", sentAt: "2026-06-20", expiresAt: "2026-06-27" },
];

export const notifications = [
  { id: "ntf_1", type: "report_ready", title: "Report ready: Sarah Khan", body: "Senior Backend Engineer · scored 87/100", interviewId: "iv_1042", createdAt: "12 min ago", read: false },
  { id: "ntf_2", type: "interview_started", title: "Ahmed Ali started the interview", body: "Frontend Engineer · live now", interviewId: "iv_1044", createdAt: "38 min ago", read: false },
  { id: "ntf_3", type: "report_ready", title: "Report ready: Alex Rivera", body: "Full Stack Developer · scored 92/100", interviewId: "iv_1041", createdAt: "Yesterday", read: false },
  { id: "ntf_4", type: "invite_accepted", title: "Kofi Mensah joined Northwind Labs", body: "Role: HR", createdAt: "Sep 2", read: true },
  { id: "ntf_5", type: "link_expired", title: "Interview link expired", body: "Carlos Mendes did not start the SRE interview", interviewId: "iv_1030", createdAt: "Sep 29", read: true },
];
