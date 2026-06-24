import { NavLink } from "./NavLink";

const links = [
  ["/dashboard/worker", "Overview"],
  ["/dashboard/worker/scan", "Scan"],
  ["/dashboard/worker/barcodes", "Barcodes"],
  ["/dashboard/worker/transactions", "Transactions"],
  ["/dashboard/worker/tips", "Tips"],
  ["/dashboard/worker/claims", "Claims"],
  ["/dashboard/worker/profile", "Profile"],
];

export function WorkerNav() {
  return links.map(([href, label]) => <NavLink key={href} href={href}>{label}</NavLink>);
}
