import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.legalName,
    short_name: site.name,
    description: site.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#F5F2EA",
    theme_color: "#062A14",
    icons: [{ src: "/images/nacos-logo.png", sizes: "250x250", type: "image/png" }],
  };
}
