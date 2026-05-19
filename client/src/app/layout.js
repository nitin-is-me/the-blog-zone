import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Blog Zone",
  description: "The Blog Zone is an open source, secure blogging platform to publish public or private blogs with full control.",
  keywords: [
    "blogging platform",
    "open source blog",
    "secure blog platform",
    "personal blogging",
    "tech blogs",
  ],
  verification: {
    google: "OcTLnRMAPQBsCsFlZjz9CV2WL1SNSbk-5aoeqT8uEDs"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
