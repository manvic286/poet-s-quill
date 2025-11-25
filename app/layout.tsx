import type React from "react"
// ... existing code ...
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
// Dev overlay is a client component — import it directly and it will be rendered as a
// client boundary inside this Server Component. Avoid using `ssr: false` in server
// components (next/dynamic(..., { ssr: false }) is invalid here).
import DevOverlay from '@/components/dev/dev-overlay'

// <CHANGE> Updated metadata for poetry app
import type { Metadata } from "next"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Poet's Quill - Write & Share Your Poems",
  description: "A beautiful app for poets to write, store, and share their poems with custom backgrounds and fonts.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/quill-dark.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/quill-light.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'development' && <DevOverlay />}
        <Analytics />
      </body>
    </html>
  )
}
