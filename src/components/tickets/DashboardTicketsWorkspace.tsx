import type { UserRole } from "@/lib/types/backend";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

const ticketEndpointByRole: Record<UserRole, string> = {
  Admin: "GET /api/admin/tickets · GET /api/tickets · GET /api/users/me",
  Owner: "GET /api/owner/tickets · GET /api/tickets · GET /api/users/me",
  Worker: "GET /api/worker/tickets · GET /api/tickets/assigned · GET /api/users/me",
  Affiliate: "GET /api/users/me",
  User: "GET /api/user/tickets · GET /api/tickets/me · GET /api/users/me",
};

const ticketCopyByRole: Record<UserRole, { title: string; description: string; cards: Array<[string, string]> }> = {
  Admin: {
    title: "Ticket oversight",
    description: "Platform ticket events, capacity, purchased QR records, verification state, and audit visibility for admin review.",
    cards: [
      ["Platform review", "Use this area to inspect ticket events, purchased tickets, scan status, and backend ticket health."],
      ["Fallback safe", "If admin ticket endpoints are not deployed yet, the page keeps the table shell stable instead of sending operators to public routes."],
    ],
  },
  Owner: {
    title: "Owner tickets",
    description: "Business ticket events, customer purchases, QR delivery, scan verification, and event capacity for owner operations.",
    cards: [
      ["Event control", "Track ticket products, event readiness, purchase status, and customer access from inside the owner dashboard."],
      ["Business records", "The table tries owner-specific ticket endpoints first, then falls back safely when production routes are not available."],
    ],
  },
  Worker: {
    title: "Worker ticket scans",
    description: "Assigned ticket scans, QR validation tasks, and gate verification context for worker operations.",
    cards: [
      ["Scan workflow", "Workers should verify QR tickets inside the dashboard without jumping to public ticket screens."],
      ["Stable fallback", "If ticket assignments are unavailable, the dashboard still renders a safe table state."],
    ],
  },
  Affiliate: {
    title: "Affiliate ticket context",
    description: "Affiliate-visible ticket campaign context where ticket referral features are enabled by the backend.",
    cards: [
      ["Referral context", "Ticket campaign referrals can be connected here when the backend exposes affiliate ticket records."],
      ["Profile fallback", "Until affiliate ticket records exist, the workspace falls back to the signed-in affiliate profile."],
    ],
  },
  User: {
    title: "My tickets",
    description: "Purchased ticket records, QR access, scan status, payment state, and event details for the signed-in user.",
    cards: [
      ["Your QR tickets", "This page should show purchased tickets and QR access when the backend exposes user ticket records."],
      ["No public redirect", "Signed-in users stay inside the dashboard. If ticket endpoints are missing in prod, the page falls back safely instead of showing only placeholder text."],
    ],
  },
};

export function DashboardTicketsWorkspace({ role }: { role: UserRole }) {
  const copy = ticketCopyByRole[role];

  return (
    <RouteSectionPage role={role.toUpperCase()} title={copy.title} description={copy.description} endpoint={ticketEndpointByRole[role]}>
      <section className="grid gap-4 lg:grid-cols-2">
        {copy.cards.map(([title, description]) => (
          <article key={title} className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Ticket workspace</p>
            <h2 className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{description}</p>
          </article>
        ))}
      </section>
    </RouteSectionPage>
  );
}
