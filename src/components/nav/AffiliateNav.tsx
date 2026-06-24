import { NavLink } from "./NavLink";

const links = [
  ["/dashboard/affiliate", "Overview"],
  ["/dashboard/affiliate/onboarding", "Onboarding"],
  ["/dashboard/affiliate/referrals", "Referrals"],
  ["/dashboard/affiliate/commissions", "Commissions"],
  ["/dashboard/affiliate/tips", "Tips"],
  ["/dashboard/affiliate/payouts", "Payouts"],
  ["/dashboard/affiliate/marketing-assets", "Assets"],
  ["/dashboard/affiliate/performance", "Performance"],
];

export function AffiliateNav() {
  return links.map(([href, label]) => <NavLink key={href} href={href}>{label}</NavLink>);
}
