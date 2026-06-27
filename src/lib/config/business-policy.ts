export const BUSINESS_PRICING_PLANS = [
  {
    name: "Free Trial",
    price: "0",
    priceDisplay: "R0",
    priceCurrency: "ZAR",
    billingSuffix: null,
    caption: "14-day trial",
    highlight: false,
    description: "For a small team testing barcode tracking before committing to a paid plan.",
    features: ["2 workers", "Unlimited products", "Unlimited barcode scanning", "Affiliate promo QR tracking", "Core owner dashboard"],
  },
  {
    name: "Plus",
    price: "880.00",
    priceDisplay: "R880",
    priceCurrency: "ZAR",
    billingSuffix: "month",
    caption: "Per month",
    highlight: true,
    description: "For growing businesses that need more workers, clean inventory visibility, and stronger daily operations.",
    features: ["5 workers", "Unlimited products", "Unlimited barcode scanning", "Affiliate promo QR tracking", "Transactions and reports"],
  },
  {
    name: "Pro",
    price: "2300.00",
    priceDisplay: "R2,300",
    priceCurrency: "ZAR",
    billingSuffix: "month",
    caption: "Per month",
    highlight: false,
    description: "For businesses that need unlimited workers, tips, advanced analysis, and full operational visibility.",
    features: ["Unlimited workers", "Worker tips platform", "Business Analysis AI", "Worker clocker", "Affiliate promo QR tracking"],
  },
] as const;

export const SOFTWARE_APPLICATION_OFFERS = BUSINESS_PRICING_PLANS.map(({ name, price, priceCurrency }) => ({
  "@type": "Offer",
  name,
  price,
  priceCurrency,
}));

export const AFFILIATE_COMMISSION_TIERS = [
  { rate: 18, label: "first 3 months" },
  { rate: 23, label: "after 3 months" },
  { rate: 28, label: "after 1 year" },
] as const;

export const AFFILIATE_COMMISSION_SUMMARY = AFFILIATE_COMMISSION_TIERS.map((tier) => `${tier.rate}% ${tier.label}`).join(", ");
