import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const title = "CupDraw — Draw the cup. Pick the champion.";
const description =
  "Add 16 teams, run the lottery draw, and play out a Champions League–style knockout bracket. No accounts, no data — everything stays in your browser.";

export const metadata: Metadata = {
  title: { default: title, template: "%s · CupDraw" },
  description,
  applicationName: "CupDraw",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c1424" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <Providers>
          <div className="app-bg" aria-hidden />
          {children}
        </Providers>
      </body>
    </html>
  );
}
