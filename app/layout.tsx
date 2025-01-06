import { ClerkProvider } from '@clerk/nextjs'
import { NavBar } from '@/components/nav-bar'
import { Toaster } from "@/components/ui/toaster"
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <NavBar />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

