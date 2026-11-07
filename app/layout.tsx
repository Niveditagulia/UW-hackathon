import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Gentle Grove — A little play. A brighter day.",
  description:
    "Your daily cognitive activities, personal reports, and a protected care-team workspace.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    title: "Gentle Grove",
    statusBarStyle: "default",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
