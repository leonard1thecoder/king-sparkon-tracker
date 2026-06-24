import { NavLink } from "./NavLink";

const links = [
  ["/dashboard/admin", "Overview"],
  ["/dashboard/admin/users", "Users"],
  ["/dashboard/admin/businesses", "Businesses"],
  ["/dashboard/admin/promotions", "Promotions"],
  ["/dashboard/admin/scan-logs", "Scan logs"],
  ["/dashboard/admin/settings", "Settings"],
];

export function AdminNav() {
  return links.map(([href, label]) => <NavLink key={href} href={href}>{label}</NavLink>);
}
