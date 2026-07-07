import type { Metadata } from "next";
import { AiBarcodeVerify } from "@/components/barcode/AiBarcodeVerify";

export const metadata: Metadata = {
  title: "AI Barcode Verify | King Sparkon Tracker",
  description:
    "Take barcode pictures, extract product barcodes or stock unit codes, verify them against stored King Sparkon Tracker data, and receive AI explanations.",
  alternates: { canonical: "/barcode-ai" },
};

export default function BarcodeAiPage() {
  return <AiBarcodeVerify />;
}
