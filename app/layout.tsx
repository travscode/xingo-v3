import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Manrope } from "next/font/google";
import { AppBootstrap } from "@/components/auth/app-bootstrap";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { GA4Analytics } from "@/components/providers/ga4-analytics";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-J7M1JVS5HM";

export const metadata: Metadata = {
  title: {
    default: "XINGO",
    template: "%s | XINGO",
  },
  description:
    "AI interpreter training with repeatable voice simulations, score tracking, micro-credentials, and organization oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
                  send_page_view: true,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
        <body className={`${sans.variable} ${display.variable} antialiased`}>
          <Suspense fallback={null}>
            <GA4Analytics />
          </Suspense>
          <ConvexClientProvider>
            <AppBootstrap />
            {children}
          </ConvexClientProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
