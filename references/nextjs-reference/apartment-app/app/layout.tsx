import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APARTMENT MANAGEMENT",
  description: "A simple, accessible apartment management experience for COMMUNITY PORTAL residents, administrators and security teams.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
