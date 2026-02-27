import { ThemeProvider } from "next-themes";
import { Toaster } from "~/components/ui/sonner";
import { ReactNode } from "react";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "Ember — Visual PostgreSQL ERD Designer",
  description:
    "Design your PostgreSQL database schema visually with Ember. Create ERDs, define relationships, and export production-ready SQL instantly.",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
