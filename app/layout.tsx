import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from "next/font/google"
import "./globals.css"
import NavBar from '@/components/nav-bar'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <NavBar />
          <main className="pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}

