'use server'

import { signIn } from '@/auth'

// 클라이언트 컴포넌트에서도 로그인 버튼을 만들 수 있도록 감싼 것입니다.
export async function signInWithNaver(redirectTo: string) {
  await signIn('naver', { redirectTo })
}
