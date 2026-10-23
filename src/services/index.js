// Data-access layer. UI code imports only from here, never from @/data.
export { authService } from "./auth";
export { interviewsService } from "./interviews";
export { candidatesService } from "./candidates";
export { dashboardService } from "./dashboard";
export { workspacesService, membersService, invitationsService } from "./organization";
export { resumesService, notificationsService, searchService } from "./misc";
