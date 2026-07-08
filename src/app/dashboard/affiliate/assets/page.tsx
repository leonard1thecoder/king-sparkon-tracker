import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

const assetGuidance = [
  ["WhatsApp opener", "Hi, I’m sharing King Sparkon Tracker — a barcode, QR, inventory, tips, and ticket tracking system for modern businesses."],
  ["Business pitch", "Use this when speaking to shop owners, event organizers, and teams that need cleaner product or ticket tracking."],
  ["QR campaign note", "Pair your affiliate link with a QR card so prospects can register or request a demo without typing the URL."],
] as const;

export default function AffiliateCampaignAssetsPage() {
  return (
    <RouteSectionPage
      role="AFFILIATE"
      title="Campaign assets"
      description="WhatsApp scripts, social copy, QR campaign ideas, and backend-visible affiliate profile data for promoting King Sparkon Tracker."
      endpoint="GET /api/affiliate/assets · GET /api/users/me"
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {assetGuidance.map(([title, copy]) => (
          <article key={title} className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Affiliate asset</p>
            <h2 className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{copy}</p>
          </article>
        ))}
      </section>
    </RouteSectionPage>
  );
}
