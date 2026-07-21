import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Naturals — Entrepreneur Networking",
  description: "Connect, share, and grow with Naturals entrepreneur networking events.",
  openGraph: {
    title: "Naturals — Entrepreneur Networking",
    description: "Connect, share, and grow with Naturals entrepreneur networking events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
