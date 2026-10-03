import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { GA4Analytics } from "@/components/providers/ga4-analytics";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics";
import "./globals.css";

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://www.xingo.ai"),
  title: {
    default: "XINGO",
    template: "%s | XINGO",
  },
  openGraph: { siteName: "XINGO", locale: "en_AU", type: "website" },
  twitter: { card: "summary_large_image" },
  description:
    "Practise interpreting out loud with AI role-play partners, get scored instantly, and prepare for NAATI CCL and real assignments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <head>
        {/* Clerk serves the sign-in form; connecting early saves a round trip on /sign-up and /sign-in. */}
        <link rel="preconnect" href="https://clerk.xingo.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://clerk.xingo.ai" />
        {GA4_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_MEASUREMENT_ID}', {
                  send_page_view: false,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className={`${sans.variable} antialiased`}>
        <Suspense fallback={null}>
          <GA4Analytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
