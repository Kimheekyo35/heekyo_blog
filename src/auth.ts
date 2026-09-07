import NextAuth from 'next-auth'
import Naver from 'next-auth/providers/naver'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

// AUTH_NAVER_ID / AUTH_NAVER_SECRET는 Auth.js가 이름만 보고 자동으로 읽어갑니다.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Naver],
  session: { strategy: 'database' },
  // 로그인 화면을 직접 만들기 전까지는 Auth.js 기본 페이지를 사용합니다.
  // 나중에 만들면 pages: { signIn: '/login' } 를 다시 켜면 됩니다.
  callbacks: {
    // 화면에서 "이 사람이 나인가"를 판단할 수 있도록 세션에 id와 role을 실어 보냅니다.
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as { role?: string }).role ?? 'USER'
      return session
    },
  },
  events: {
    // 로그인할 때마다 확인합니다. 가입 시점에만 검사하면, ADMIN_EMAIL을 채우기 전에
    // 먼저 로그인해 버린 계정이 영영 일반 사용자로 남습니다.
    async signIn({ user, account }) {
      const adminNaverId = process.env.ADMIN_NAVER_ID
      const adminEmail = process.env.ADMIN_EMAIL

      // 네이버 계정 고유번호가 1순위. 이메일은 네이버에서 제공에 동의한 경우에만
      // 넘어오므로 보조 수단으로만 씁니다.
      const isAdmin =
        (!!adminNaverId &&
          account?.provider === 'naver' &&
          account.providerAccountId === adminNaverId) ||
        (!!adminEmail && !!user.email && user.email === adminEmail)

      if (!isAdmin || !user.id) return
      await db.user.updateMany({
        where: { id: user.id, role: { not: 'ADMIN' } },
        data: { role: 'ADMIN' },
      })
    },
  },
})
