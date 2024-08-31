import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Noto_Sans_Mono as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "NFL Probabilities | Game Predictions for NFL Postseason",
  description: "Get accurate NFL game probabilities and predictions for the postseason. Stay updated with the latest odds and forecasts for upcoming NFL playoff games.",
  keywords: "NFL, football, probabilities, predictions, postseason, playoffs, odds, forecasts",
  authors: [
    {
      name: "Michael Djorup",
      url: "https://x.com/michaeldjorup",
    },
    {
      url: "https://www.nfl.com/"
    }
  ],
  robots: "index, follow",
  openGraph: {
    title: "NFL Probabilities | Game Predictions for NFL Postseason",
    siteName: "NFLProbabilities.com",
    locale: "en_US",
    description: "Get accurate NFL game probabilities and predictions for the postseason. Stay updated with the latest odds and forecasts for upcoming NFL playoff games.",
    url: "https://nflprobabilities.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>{children}</body>
    </html>
  );
}
