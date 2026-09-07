import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: '희교 blog',
    template: '%s · 희교 blog',
  },
  description: '일상과 만드는 이야기를 기록합니다.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-12">{children}</main>
        <footer className="border-t border-border mt-8">
          <div className="max-w-5xl mx-auto px-5 py-8 flex items-center justify-between text-sm text-muted">
            <span>© {new Date().getFullYear()} 희교</span>
            <span className="font-mono text-xs">powered by blot</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
