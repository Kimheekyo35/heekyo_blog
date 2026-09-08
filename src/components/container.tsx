/**
 * 글을 읽는 화면들의 공통 폭.
 * 홈 바탕화면은 화면을 꽉 채워야 해서, 폭 제한은 layout이 아니라 화면마다 이걸로 겁니다.
 */
export function Container({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={`mx-auto w-full max-w-5xl px-5 py-12 ${className}`}>
      {children}
    </div>
  )
}
