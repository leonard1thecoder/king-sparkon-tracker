import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/content/Prose";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | King Sparkon",
  description: "Privacy policy for King Sparkon: what data is collected, how it is used, cookies, subscriber contacts, and your rights.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy policy" }]} />
        <section className="ks-section pt-4 pb-0">
          <div className="ks-wrap">
            <p className="ks-eyebrow">Legal</p>
            <h1 className="ks-h1 mt-3">Privacy policy</h1>
            <p className="ks-lead mt-5">Last updated: 12 February 2026 • Owner: Sizolwakhe Leonard Mthimunye, King Sparkon™ • This page explains what we collect, why, and how you can control it.</p>
          </div>
        </section>

        <div className="ks-wrap grid gap-10 py-12 pb-24 lg:grid-cols-[1.7fr_0.8fr]">
          <Prose>
            <h2>1. What we collect</h2>
            <p><strong>Account data:</strong> username, emailAddress, cellphone number, business name (for Owners), physical address (for User/Business Owner/Affiliate as required by registration — addressStreet, suburb, city, province, postal code, country), PayPal link where provided for affiliate or business payouts, and role/privilege.</p>
            <p><strong>Operational data:</strong> products, barcodes/unit codes, transactions, tips, withdrawals, ticket purchases and check-ins, job postings and applications, affiliate referrals and promotion metadata, audit logs and scan logs. This data is created through your use of dashboards and is retained to preserve the ledger.</p>
            <p><strong>Inquiry & subscriber data:</strong> Contact inquiries via POST /api/contact-inquiries and subscriber contacts via POST /api/subscribers (contact = email or phone). Promotion targeting may use subscriber contact type (CLIENT, AFFILIATE, etc.). Bulk imports are handled via the admin subscriber import flow.</p>
            <p><strong>Technical data:</strong> Authentication tokens stored as httpOnly cookies (king_sparkon_tracker_access_token / refresh_token), session claims decoded from JWT (userId, businessId, roles, exp), request headers, and error logs. We do not store backend access tokens in localStorage or expose BACKEND_URL to the browser.</p>

            <h2>2. Why we process it</h2>
            <ul>
              <li>To provide role-safe dashboards and enforce access control via the proxy (<code>src/proxy.ts</code>).</li>
              <li>To create and track barcode inventory, QR tickets, transactions and payouts.</li>
              <li>To send verification, password reset and transactional communications.</li>
              <li>To operate promotions only to the audience and channel you select, with a quote before sending.</li>
              <li>To maintain audit trails, reports and capacity dashboards.</li>
            </ul>

            <h2>3. Legal basis</h2>
            <p>We process data on the basis of contract performance (providing the platform you registered for), legitimate interest (security, fraud prevention, platform improvement, and audit integrity), consent (newsletters/subscriber opt-in, affiliate promotion opt-in where applicable), and compliance with legal obligations.</p>

            <h2>4. Cookies</h2>
            <p>We use httpOnly, Secure (in production), SameSite=Lax cookies for authentication — not for cross-site tracking. The Next.js proxy attaches the Bearer token server-side. We also load Google AdSense with <code>async</code> and <code>crossorigin=anonymous</code> per <code>src/app/layout.tsx:118</code>. AdSense may set its own cookies per Google&apos;s policy. You can manage cookies through your browser settings; rejecting auth cookies will prevent login and dashboard access.</p>

            <h2>5. Sharing</h2>
            <p>We do not sell your data. We share it only with: the Spring Boot backend that powers the API, infrastructure providers required to host storage and logs (e.g., Supabase for logo storage as in next.config.ts), payment providers when you initiate website payments or tips, and Google publishers if AdSense is enabled. Each recipient is limited to the data needed to perform its function.</p>

            <h2>6. Retention</h2>
            <p>Account and ledger data are retained while your account exists and for a reasonable period afterwards to preserve audit integrity and comply with legal obligations. Contact inquiries and subscriber data are retained until you request deletion via DELETE /api/subscribers?contact=… or via the contact form. You may request account deletion via an authenticated request; ledger entries tied to financial transactions may be retained in anonymized or aggregated form where law requires.</p>

            <h2>7. Your rights</h2>
            <p>You may request access, correction, export, restriction, or deletion of your personal data, and object to or withdraw consent for direct marketing. To exercise these, contact us via <Link href="/contact">the contact page</Link> and include the email or phone associated with your account. Verification may be required.</p>

            <h2>8. Children</h2>
            <p>The platform is not directed to children under 16. We do not knowingly collect data from children for marketing or unrelated processing.</p>

            <h2>9. Changes</h2>
            <p>We will update this page and the last-updated date when practices change. Significant changes that expand processing will be highlighted in the app and, where required, will seek fresh consent.</p>

            <h2>10. Contact</h2>
            <p>Data controller: Sizolwakhe Leonard Mthimunye (King Sparkon) — use the <Link href="/contact">contact form</Link> for privacy inquiries. You may also reach the public GitHub profile linked in the footer for platform-related matters.</p>
          </Prose>

          <div className="space-y-5">
            <div className="ks-card p-6">
              <p className="text-sm font-black">Not a legal template copy</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">This policy describes the actual routes and storage used in this codebase — httpOnly cookies, proxy-based auth, and public contact/subscriber endpoints — not a generic template. It avoids claims about certifications or partnerships that do not exist.</p>
            </div>
            <div className="ks-card p-6">
              <p className="text-sm font-black">Related pages</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li><Link href="/terms" className="text-[var(--ks-ink)] underline underline-offset-4">Terms of service →</Link></li>
                <li><Link href="/about" className="text-[var(--ks-ink)] underline underline-offset-4">About the platform →</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
