'use server'

import { signIn } from '@/auth'

// 클라이언트 컴포넌트에서도 로그인 버튼을 만들 수 있도록 감싼 것입니다.
export async function signInWithNaver(redirectTo: string) {
  // 한글 주소가 HTTP 헤더에 그대로 들어가지 않도록 인코딩합니다.
  await signIn('naver', { redirectTo: encodeURI(redirectTo) })
}
