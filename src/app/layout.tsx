import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { BlotIcon } from '@/components/blot-icon'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'KIM HEEKYO',
    template: '%s · KIM HEEKYO',
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
            <span>© {new Date().getFullYear()} KIM HEEKYO</span>
            <span className="flex items-center gap-1.5 font-mono text-xs">
              powered by
              <BlotIcon className="w-3.5 h-3.5" />
              blot
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
