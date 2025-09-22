import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Disaster Escape Maze - Learn Safety Through Gaming",
  description:
    "Educational disaster preparedness website with interactive maze game. Learn fire, earthquake, flood, cyclone, and landslide safety tips through engaging gameplay.",
  generator: "v0.app",
  keywords: [
    "disaster preparedness",
    "emergency safety",
    "educational game",
    "fire safety",
    "earthquake safety",
    "flood safety",
    "cyclone safety",
    "landslide safety",
    "maze game",
    "safety training",
  ],
  authors: [{ name: "Disaster Escape Maze Team" }],
  creator: "v0.app",
  publisher: "v0.app",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://disaster-escape-maze.vercel.app",
    title: "Disaster Escape Maze - Learn Safety Through Gaming",
    description: "Educational disaster preparedness website with interactive maze game",
    siteName: "Disaster Escape Maze",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disaster Escape Maze - Learn Safety Through Gaming",
    description: "Educational disaster preparedness website with interactive maze game",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
