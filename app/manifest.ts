import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YONNE Livreur",
    short_name: "YONNE",
    description: "Application livreur · livraison last-mile Sénégal",
    start_url: "/driver/carte",
    scope: "/",
    display: "standalone",
    background_color: "#FAF7F0",
    theme_color: "#15803D",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
