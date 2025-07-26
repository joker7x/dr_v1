import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "دليل أسعار الأدوية المصرية",
  description: "تطبيق لمتابعة أسعار الأدوية في مصر مع التحديثات المباشرة ونواقص الأدوية",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "دليل الأدوية",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "دليل أسعار الأدوية المصرية",
    title: "دليل أسعار الأدوية المصرية",
    description: "تطبيق لمتابعة أسعار الأدوية في مصر مع التحديثات المباشرة ونواقص الأدوية",
  },
  twitter: {
    card: "summary",
    title: "دليل أسعار الأدوية المصرية",
    description: "تطبيق لمتابعة أسعار الأدوية في مصر",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
