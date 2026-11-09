import { LayoutGrid, MessagesSquare, Users, Plus, FileText, Boxes, UserCog, MailPlus, Settings } from "lucide-react";

const overview = { key: "overview", label: "Overview", to: "/app", icon: LayoutGrid, match: (p) => p === "/app" || p === "/app/" };
const interviews = { key: "interviews", label: "Interviews", to: "/app/interviews", icon: MessagesSquare, match: (p) => p.startsWith("/app/interviews") && p !== "/app/interviews/new" };
const newInterview = { key: "new", label: "New Interview", to: "/app/interviews/new", icon: Plus, perm: "interview:create", denied: "disable" };
const workspaces = { key: "workspaces", label: "Workspaces", to: "/app/workspaces", icon: Boxes };

export const NAVIGATION = {
  individual: [
    { section: "individual", items: [overview, interviews, newInterview, { key: "resume", label: "Resume", to: "/app/resume", icon: FileText }] },
  ],
  organization: [
    { section: "Hiring", items: [overview, interviews, { key: "candidates", label: "Candidates", to: "/app/candidates", icon: Users }, newInterview] },
    {
      section: "organization",
      items: [
        { key: "members", label: "Members", to: "/app/members", icon: UserCog, roles:["ADMIN"] },
        { key: "invitations", label: "Invitations", to: "/app/invitations", icon: MailPlus, roles:["ADMIN"] },
        // { key: "settings", label: "Settings", to: "/app/settings", icon: Settings },
      ],
    },
  ],
};
