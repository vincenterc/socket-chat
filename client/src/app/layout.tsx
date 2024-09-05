import { Toaster } from '@/component/toaster'
import { UsernameProvider } from '@/component/username-provider'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <UsernameProvider>{children}</UsernameProvider>
      </body>
    </html>
  )
}
