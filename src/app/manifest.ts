import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "King Sparkon Tracker",
    short_name: "King Sparkon",
    description: "Barcode inventory, QR tickets, jobs, worker tips, affiliate commissions, and role-safe business operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#f6c945",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/king-sparkon-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
