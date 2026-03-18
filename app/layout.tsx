import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Manrope } from "next/font/google";
import { AppBootstrap } from "@/components/auth/app-bootstrap";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

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
      <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
        <body className={`${sans.variable} ${display.variable} antialiased`}>
          <ConvexClientProvider>
            <AppBootstrap />
            {children}
          </ConvexClientProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
