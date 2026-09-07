import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'
import { CATEGORIES } from '@/lib/categories'
import { CategoryNav } from '@/components/category-nav'
import { HeaderScene } from '@/components/header-scene'

export async function SiteHeader() {
  const session = await auth()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  return (
    // 밤하늘 장식을 깔아야 해서 라이트/다크 모드와 무관하게 항상 어둡습니다.
    <header className="sticky top-0 z-30 bg-[#08060f] text-white">
      <div className="relative max-w-5xl mx-auto px-5">
        <HeaderScene />

        {/* 장식 위에 올라오도록 */}
        <div className="relative">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="group">
              {/* 영문 대문자는 자간을 벌려야 이름처럼 읽힙니다. */}
              <span className="text-lg font-bold tracking-[0.18em] text-white group-hover:text-accent transition-colors">
                KIM HEEKYO
              </span>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              {isAdmin && (
                <Link
                  href="/write"
                  className="px-3.5 py-1.5 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                >
                  글쓰기
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-2.5 pl-1">
                  <span className="text-white/60 hidden sm:inline">{user.name ?? '익명'}</span>
                  <form
                    action={async () => {
                      'use server'
                      await signOut({ redirectTo: '/' })
                    }}
                  >
                    <button
                      type="submit"
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      로그아웃
                    </button>
                  </form>
                </div>
              ) : (
                <form
                  action={async () => {
                    'use server'
                    await signIn('naver')
                  }}
                >
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-full bg-[#03C75A] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    네이버 로그인
                  </button>
                </form>
              )}
            </nav>
          </div>

          <CategoryNav categories={CATEGORIES} />
        </div>
      </div>
    </header>
  )
}
