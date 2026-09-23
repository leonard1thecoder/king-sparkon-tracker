// Role-aware dashboard links for components shared between the user and
// owner dashboards (shared cart, favorites). Owner equivalents live under
// /dashboard/owner/*, so user hrefs are remapped when role is "owner".

export type SharedDashboardRole = "user" | "owner";

export function dashboardHref(role: SharedDashboardRole, href: string): string {
  if (role !== "owner") return href;
  return href
    .replace("/dashboard/user/shop", "/dashboard/owner/products")
    .replace("/dashboard/user/tickets/buy", "/dashboard/owner/tickets")
    .replace("/dashboard/user/tickets/events/", "/dashboard/owner/tickets/events/")
    .replace("/dashboard/user/jobs", "/dashboard/owner/jobs");
}
