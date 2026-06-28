import type { TicketRole, TicketSession } from "@/types/tickets";

const ROLE_STORAGE_KEY = "king-sparkon-ticket-role";

const demoSessions: Record<TicketRole, TicketSession> = {
  USER: {
    id: "user-demo-001",
    name: "Sizolwakhe Ticket Buyer",
    email: "buyer@kingsparkon.co.za",
    roles: ["USER"],
  },
  OWNER: {
    id: "owner-demo-001",
    name: "King Sparkon Owner",
    email: "owner@kingsparkon.co.za",
    roles: ["OWNER"],
  },
  WORKER: {
    id: "worker-demo-001",
    name: "Gate Worker",
    email: "worker@kingsparkon.co.za",
    roles: ["WORKER"],
  },
  ADMIN: {
    id: "admin-demo-001",
    name: "King Sparkon Admin",
    email: "admin@kingsparkon.co.za",
    roles: ["ADMIN", "OWNER", "WORKER"],
  },
};

function isTicketRole(value: string | null): value is TicketRole {
  return value === "USER" || value === "OWNER" || value === "WORKER" || value === "ADMIN";
}

export function getTicketSession(): TicketSession {
  // TODO: Replace this frontend-ready demo session with the real auth provider/JWT user once the backend exposes ticket roles.
  if (typeof window === "undefined") return demoSessions.USER;

  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return demoSessions[isTicketRole(storedRole) ? storedRole : "USER"];
}

export function setDemoTicketRole(role: TicketRole): TicketSession {
  // TODO: Remove role switching when backend authorization is connected.
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  }
  return demoSessions[role];
}

export function userHasTicketRole(session: TicketSession, allowedRoles: TicketRole[]) {
  return session.roles.some((role) => allowedRoles.includes(role));
}

export const ticketRoleOptions = Object.keys(demoSessions) as TicketRole[];
