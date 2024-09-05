import { Toaster } from '@/component/toaster'
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><Toaster />{children}</body>
    </html>
  )
}
