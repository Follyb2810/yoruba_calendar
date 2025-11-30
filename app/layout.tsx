import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/ui/shared/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kọ́jọ́dá — Yoruba Calendar",
  description:
    "Explore Yoruba festivals, Orisa celebrations, and the Yoruba calendar. Learn about traditional customs and sacred days.",
  keywords: [
    "Yoruba calendar",
    "Orisa",
    "Yoruba festivals",
    "African culture",
    "Traditional Yoruba",
    "Olokun",
    "Oshun",
    "Sango",
    "Elegba",
    "Yemoja",
  ],
  authors: [{ name: "Babatunde Yusuf Folorunsho" }],
  openGraph: {
    title: "Kọ́jọ́dá — Yoruba Calendar",
    description:
      "Explore Yoruba festivals, Orisa celebrations, and the Yoruba calendar. Learn about traditional customs and sacred days.",
    url: "https://your-site.vercel.app",
    siteName: "Kọ́jọ́dá",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kọ́jọ́dá Yoruba Calendar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kọ́jọ́dá — Yoruba Calendar",
    description:
      "Explore Yoruba festivals, Orisa celebrations, and the Yoruba calendar.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
