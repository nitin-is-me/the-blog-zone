import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://the-blog-zone.vercel.app"),
  title: {
    default: "The Blog Zone | Write and Explore Articles",
    template: "%s | The Blog Zone"
  },
  description: "The Blog Zone is a secure, open-source blogging platform where you can publish public or private blogs with full control.",
  keywords: [
    "blogging platform",
    "open source blog",
    "secure blog platform",
    "personal blogging",
    "tech blogs",
    "write articles",
    "read blogs"
  ],
  authors: [{ name: "Nitin", url: "https://github.com/nitin-is-me" }],
  creator: "Nitin",
  openGraph: {
    title: "The Blog Zone",
    description: "Publish public or private blogs with full control on this secure, open-source platform.",
    url: "https://the-blog-zone.vercel.app",
    siteName: "The Blog Zone",
    locale: "en_US",
    type: "website",
  },
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
  verification: {
    google: "OcTLnRMAPQBsCsFlZjz9CV2WL1SNSbk-5aoeqT8uEDs"
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://the-blog-zone.vercel.app/#website",
      "url": "https://the-blog-zone.vercel.app",
      "name": "The Blog Zone",
      "description": "Secure, open-source blogging platform.",
      "publisher": {
        "@id": "https://the-blog-zone.vercel.app/#organization"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://the-blog-zone.vercel.app/#organization",
      "name": "The Blog Zone",
      "url": "https://the-blog-zone.vercel.app",
      "logo": "https://the-blog-zone.vercel.app/favicon.ico"
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
