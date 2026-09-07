import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'

export async function SiteHeader() {
  const session = await auth()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          희교 블로그
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {isAdmin && (
            <Link
              href="/write"
              className="px-3 py-1.5 rounded-md bg-foreground text-background hover:opacity-85"
            >
              글쓰기
            </Link>
          )}

          {user ? (
            <>
              <span className="text-muted hidden sm:inline">{user.name ?? '익명'}</span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button type="submit" className="text-muted hover:text-foreground">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                'use server'
                await signIn('naver')
              }}
            >
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md border border-border hover:bg-border/40"
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
