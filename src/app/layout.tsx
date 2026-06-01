import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kush-System | Non-Profit Organization Management",
  description:
    "Production-ready non-profit organization management system with bilingual support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${tajawal.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
