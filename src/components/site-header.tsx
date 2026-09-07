import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'
import { CATEGORIES } from '@/lib/categories'
import { CategoryNav } from '@/components/category-nav'

export async function SiteHeader() {
  const session = await auth()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="group">
            {/* 영문 대문자는 자간을 벌려야 이름처럼 읽힙니다. */}
            <span className="text-lg font-bold tracking-[0.18em] group-hover:text-accent transition-colors">
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
                <span className="text-muted hidden sm:inline">{user.name ?? '익명'}</span>
                <form
                  action={async () => {
                    'use server'
                    await signOut({ redirectTo: '/' })
                  }}
                >
                  <button
                    type="submit"
                    className="text-muted hover:text-foreground transition-colors"
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
    </header>
  )
}
