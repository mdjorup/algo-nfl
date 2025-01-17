import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Kode_Mono as FontSans } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-sans",

})

export const metadata: Metadata = {
  metadataBase: process.env.NODE_ENV == "production" ? new URL("http://nflprobabilities.com") : new URL("http://localhost:3000"),
  title: "NFL Playoff Predictions & Probabilities | NFL Game Odds",
  description: "Get NFL playoff predictions and game probabilities. Our advanced algorithms provide accurate forecasts for every postseason matchup. Stay ahead with expert NFL odds and analysis.",
  keywords: "NFL playoffs, football predictions, game probabilities, postseason odds, live NFL forecasts, playoff matchups, NFL analytics",
  authors: [
    {
      name: "Michael Djorup",
      url: "https://x.com/michaeldjorup",
    },
    {
      name: "NFL.com",
      url: "https://www.nfl.com/"
    }
  ],
  creator: "Michael Djorup",
  publisher: "NFLProbabilities.com",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "NFL Playoff Predictions & Game Probabilities",
    siteName: "NFLProbabilities.com",
    locale: "en_US",
    description: "Access real-time NFL playoff predictions and game probabilities. Our cutting-edge algorithms deliver precise forecasts for every postseason matchup. Get the edge with expert NFL odds and in-depth analysis.",
    url: "https://nflprobabilities.com",
    type: "website",
    images: new URL("https://nflprobabilities.com/opengraph-image.png"),
  },
  twitter: {
    card: "summary_large_image",
    creator: "@michaeldjorup",
    title: "NFL Playoff Predictions & Game Probabilities",
    description: "Get the latest NFL playoff predictions and game probabilities.",
    images: new URL("https://nflprobabilities.com/twitter-image.png"),
  },
  category: "Sports Analytics",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>{children}</body>
      </CSPostHogProvider>
    </html>
  );
}

export default RootLayout;
