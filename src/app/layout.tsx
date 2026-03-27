import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPC News Dashboard — ZATO Marketing",
  description: "Google Ads, Microsoft Ads & Merchant Center news aggregator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
