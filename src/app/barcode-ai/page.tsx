import type { Metadata } from "next";
import { AiBarcodeVerify } from "@/components/barcode/AiBarcodeVerify";

export const metadata: Metadata = {
  title: "AI Barcode Verify | King Sparkon AI",
  description:
    "Take barcode pictures, extract product barcodes or stock unit codes, verify stored King Sparkon AI data, and receive clear AI explanations.",
  alternates: { canonical: "/barcode-ai" },
};

export default function BarcodeAiPage() {
  return <AiBarcodeVerify />;
}
