import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Console | Apartment Management Platform",
  description: "Administrative console for community operations, residents, units, and facilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
