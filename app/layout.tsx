import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Instrument_Serif } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL, site } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NACOS UNIUYO | Nigeria Association of Computing Students, University of Uyo",
    template: "%s | NACOS UNIUYO",
  },
  description: site.shortDescription,
  applicationName: site.name,
  keywords: [
    "NACOS UNIUYO",
    "NACOS University of Uyo",
    "Nigeria Association of Computing Students",
    "Faculty of Computing UNIUYO",
    "University of Uyo computer science",
    "UNIUYO hackathon",
    "SIWES Uyo",
    "Open-Track",
  ],
  authors: [{ name: "NACOS UNIUYO Software Directorate" }],
  creator: site.name,
  publisher: site.name,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    url: "/",
    title: "NACOS UNIUYO",
    description: site.shortDescription,
  },
  twitter: {
    card: "summary_large_image",
    site: site.xHandle,
    title: "NACOS UNIUYO",
    description: site.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#062A14",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={`${sans.variable} ${serif.variable} ${display.variable}`}>
      <body>
        <NextTopLoader color="#007a1e" showSpinner={false} />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <JsonLd data={[organizationSchema(), websiteSchema()]} />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
