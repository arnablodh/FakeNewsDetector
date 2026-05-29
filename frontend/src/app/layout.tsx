
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "../components/RootLayoutClient";
import Head from "next/head";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scouter - Explainable Fake News & Bias Detector",
  description: "Advanced explainable AI fake news detector, featuring real-time credibility scoring, stylometric checks, and token-level SHAP influence highlighting.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <Head>
        <Script
          id="remove-fdprocessedid"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "document.querySelectorAll('[fdprocessedid]').forEach(el => el.removeAttribute('fdprocessedid'));"
          }}
        />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-background text-foreground`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
