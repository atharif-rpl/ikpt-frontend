import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'IKPT CMS Dashboard',
  description: 'Panel Kontrol Admin IKPT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white">
        {/* Polosan, biar halaman /login nggak ada sidebar-nya */}
        {children}
      </body>
    </html>
  )
}