import { signIn } from '@/auth'

// 로그인 후 보던 글로 돌아오도록 redirectTo를 받습니다.
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
        await signIn('naver', { redirectTo })
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  )
}
