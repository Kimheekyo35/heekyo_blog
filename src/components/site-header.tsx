import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'
import { FolderIcon } from '@/components/desktop/icons'

export async function SiteHeader() {
  const session = await auth()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  return (
    // 바탕화면 위에 얹힌 메뉴 막대. 배경이 비쳐야 아래 아이콘이 지나가는 게 보입니다.
    // 이름과 카테고리 줄은 없앴습니다. 홈으로 가는 길은 왼쪽 폴더 아이콘입니다.
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          aria-label="홈으로"
          className="w-6 shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <FolderIcon />
        </Link>

        <nav className="flex items-center gap-2.5 text-sm">
          {isAdmin && (
            <Link
              href="/write"
              className="rounded-full bg-accent px-3.5 py-1.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              글쓰기
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 pl-1">
              <span className="hidden text-muted sm:inline">{user.name ?? '익명'}</span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button type="submit" className="text-muted transition-colors hover:text-foreground">
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
                className="rounded-full bg-[#03C75A] px-3.5 py-1.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                네이버 로그인
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}
