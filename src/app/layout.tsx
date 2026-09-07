import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { SiteHeader } from '@/components/site-header'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '희교 블로그',
  description: '읽고, 쓰고, 남기는 곳',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10">{children}</main>
        <footer className="border-t border-border">
          <div className="max-w-3xl mx-auto px-5 py-6 text-sm text-muted">
            <Link href="/" className="hover:underline">
              희교 블로그
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
