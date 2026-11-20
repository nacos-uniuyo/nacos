import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Instrument_Serif, Onest } from "next/font/google";
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
const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NACOS UNIUYO · Faculty of Computing, University of Uyo Portal",
    template: "%s | NACOS UNIUYO · University of Uyo",
  },
  description: site.shortDescription,
  applicationName: site.coBrandName,
  keywords: [
    "NACOS UNIUYO",
    "University of Uyo",
    "UNIUYO Faculty of Computing",
    "NACOS University of Uyo",
    "Nigeria Association of Computing Students",
    "Computer Science UNIUYO",
    "Cybersecurity UNIUYO",
    "Information Systems UNIUYO",
    "Data Analytics UNIUYO",
    "Software Engineering UNIUYO",
    "UNIUYO hackathon",
    "SIWES Uyo",
    "Open-Track",
  ],
  authors: [{ name: "NACOS UNIUYO Software Directorate · Faculty of Computing, University of Uyo" }],
  creator: site.coBrandName,
  publisher: site.coBrandName,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: `${site.name} · ${site.universityName}`,
    url: "/",
    title: "NACOS UNIUYO · Faculty of Computing, University of Uyo",
    description: site.shortDescription,
  },
  twitter: {
    card: "summary_large_image",
    site: site.xHandle,
    title: "NACOS UNIUYO · Faculty of Computing, University of Uyo",
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
    <html lang="en-NG" className={`${sans.variable} ${serif.variable} ${display.variable} ${onest.variable}`}>
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
