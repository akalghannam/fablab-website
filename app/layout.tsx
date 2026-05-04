import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FabLab Club',
  description: 'WE PLAN. WE FABRICATE — نادي فاب لاب للإبداع والتصنيع الرقمي',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-brand-dark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
