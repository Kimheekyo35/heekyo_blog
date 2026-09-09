import type { Metadata } from 'next'
import {
  Geist_Mono,
  Gaegu,
  Archivo,
  Instrument_Serif,
  Gowun_Dodum,
  Nanum_Myeongjo,
  Gowun_Batang,
  Gothic_A1,
} from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { BlotIcon } from '@/components/blot-icon'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// 손글씨 느낌의 한글 글꼴. blot 라벨 같은 장식용으로만 씁니다.
// 한글 글꼴은 용량이 크지만 글자 범위별로 쪼개져 있어서,
// 실제로 쓰는 몇 글자에 해당하는 조각만 내려받습니다.
const gaegu = Gaegu({
  variable: '--font-cute',
  weight: '400',
  subsets: ['latin'],
})

// 바탕화면 글씨. 모서리가 부드러운 고딕체라 아이콘 이름표에 잘 어울립니다.
const gowunDodum = Gowun_Dodum({
  variable: '--font-round',
  weight: '400',
  subsets: ['latin'],
})

// 홈 바탕화면의 큰 제목에 쓰는 굵은 산세리프.
const archivo = Archivo({
  variable: '--font-display',
  weight: ['800'],
  subsets: ['latin'],
})

// 굵은 제목 위에 겹치는 흘림체. 기울임만 씁니다.
const instrumentSerif = Instrument_Serif({
  variable: '--font-script',
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
})

// 글쓰기에서 고를 수 있는 본문 글꼴들.
// 글의 일부에만 쓰일 수도 있으니 미리 받아두지 않습니다(preload: false).
// 실제 조합은 globals.css의 --post-font-* 에서 기기별 대체 글꼴과 함께 묶습니다.
// next/font는 각 글꼴을 최상위 const에 하나씩 담아야 합니다.
// '궁서'가 없는 기기에서 대신 쓸 명조.
const myeongjo = Nanum_Myeongjo({
  variable: '--font-myeongjo',
  weight: ['400', '700'],
  preload: false,
})

const gowunBatang = Gowun_Batang({
  variable: '--font-batang',
  weight: ['400', '700'],
  preload: false,
})

const gothicA1 = Gothic_A1({
  variable: '--font-gothic',
  weight: ['400', '700'],
  preload: false,
})

const postFonts = [myeongjo, gowunBatang, gothicA1].map((font) => font.variable).join(' ')

export const metadata: Metadata = {
  title: {
    default: 'KIM HEEKYO',
    template: '%s · KIM HEEKYO',
  },
  description: '일상과 만드는 이야기를 기록합니다.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${geistMono.variable} ${gaegu.variable} ${gowunDodum.variable} ${archivo.variable} ${instrumentSerif.variable} ${postFonts} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
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
