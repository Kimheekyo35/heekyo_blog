import 'next-auth'

// 기본 세션 타입에는 id와 role이 없어서 직접 넓혀 줍니다.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
