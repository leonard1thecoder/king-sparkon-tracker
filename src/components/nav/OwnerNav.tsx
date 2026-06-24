import { NavLink } from "./NavLink";

const links = [
  ["/dashboard/owner", "Overview"],
  ["/dashboard/owner/products", "Products"],
  ["/dashboard/owner/workers", "Workers"],
  ["/dashboard/owner/transactions", "Transactions"],
  ["/dashboard/owner/tips", "Tips"],
  ["/dashboard/owner/withdrawals", "Withdrawals"],
  ["/dashboard/owner/promotions", "Promotions"],
  ["/dashboard/owner/reports", "Reports"],
  ["/dashboard/owner/audit", "Audit"],
  ["/dashboard/owner/billing", "Billing"],
  ["/dashboard/owner/settings", "Settings"],
];

export function OwnerNav() {
  return links.map(([href, label]) => <NavLink key={href} href={href}>{label}</NavLink>);
}
