/**
 * blot 로봇 아이콘.
 * 색을 지정하지 않고 currentColor를 쓰므로 감싼 글자 색을 그대로 따라갑니다.
 */
export function BlotIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* 안테나 */}
      <path d="M12 3.5v2.5" />
      <circle cx="12" cy="2.4" r="1.1" fill="currentColor" stroke="none" />
      {/* 머리 */}
      <rect x="4.5" y="6" width="15" height="12" rx="3.5" />
      {/* 귀 */}
      <path d="M2.5 11v2.5M21.5 11v2.5" />
      {/* 눈 */}
      <circle cx="9.5" cy="11.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11.5" r="1.15" fill="currentColor" stroke="none" />
      {/* 입 */}
      <path d="M9.5 14.8h5" />
    </svg>
  )
}
