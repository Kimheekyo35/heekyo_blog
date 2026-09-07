import { signIn } from '@/auth'

/**
 * 로그인 후 보던 글로 돌아오도록 redirectTo를 받습니다.
 *
 * 돌아갈 주소는 여기서 인코딩합니다. 슬러그가 한글이면 이동 주소가 담기는
 * HTTP 헤더에 한글이 그대로 들어가 500이 나기 때문입니다.
 */
export function LoginButton({
  redirectTo,
  children,
  className,
}: {
  redirectTo: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('naver', { redirectTo: encodeURI(redirectTo) })
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  )
}
