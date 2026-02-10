import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "System Design Canvas | Architecture Visualization Tool",
  description:
    "Create and visualize backend and distributed system architectures with professional, industry-standard components. Perfect for system design interviews, learning, and documentation.",
  keywords: [
    "system design",
    "architecture",
    "diagrams",
    "backend",
    "distributed systems",
    "interview prep",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
