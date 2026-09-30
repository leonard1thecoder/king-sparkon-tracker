import type { Metadata } from "next";
import { Suspense } from "react";
import { PayPalReturnClient } from "./paypal-return-client";

export const metadata: Metadata = {
  title: "PayPal Payment Result | King Sparkon",
  description: "Confirm a PayPal shared-cart payment and complete fulfilment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PayPalReturnPage() {
  return (
    <Suspense>
      <PayPalReturnClient />
    </Suspense>
  );
}
