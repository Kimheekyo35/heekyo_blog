/**
 * 손을 흔드는 blot 로봇. 바탕화면 타일에만 씁니다.
 * (글 안이나 꼬리말의 작은 자리에는 선으로만 그린 BlotIcon을 그대로 씁니다.)
 *
 * 진짜 3D 대신, 면마다 밝기를 달리한 그라데이션과 바닥 그림자로 입체를 냅니다.
 * 움직임은 globals.css의 .blot-* 에 있습니다.
 */
export function BlotRobot({ className = 'w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        {/* 왼쪽 위에서 빛이 든다고 보고 각 면의 밝기를 정했습니다. */}
        <linearGradient id="blot-head" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#9ec6ec" />
          <stop offset="52%" stopColor="#5f95cb" />
          <stop offset="100%" stopColor="#3f6f9f" />
        </linearGradient>
        <linearGradient id="blot-body" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#7fb0dd" />
          <stop offset="100%" stopColor="#37648f" />
        </linearGradient>
        <linearGradient id="blot-limb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ebae4" />
          <stop offset="100%" stopColor="#456f9c" />
        </linearGradient>
        <linearGradient id="blot-face" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#20364d" />
          <stop offset="100%" stopColor="#2c4a68" />
        </linearGradient>
      </defs>

      {/* 바닥 그림자 — 로봇이 떠 있는 게 아니라 놓여 있어 보이게 합니다. */}
      <ellipse cx="32" cy="58.5" rx="15" ry="2.8" fill="#24405c" opacity="0.16" />

      <g className="blot-bob">
        {/* 안테나 */}
        <path d="M32 12V7" stroke="#5f8fbe" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="32" cy="5" r="3.1" fill="#a8cdee" />
        <circle cx="31" cy="4" r="1.1" fill="#fff" opacity="0.85" />

        {/* 귀 */}
        <rect x="9.5" y="22" width="5" height="10" rx="2.5" fill="url(#blot-limb)" />
        <rect x="49.5" y="22" width="5" height="10" rx="2.5" fill="url(#blot-limb)" />

        {/* 몸통 — 머리보다 뒤에 있으므로 먼저 그립니다. */}
        <rect x="20" y="38" width="24" height="15" rx="6.5" fill="url(#blot-body)" />
        <rect x="23" y="40" width="18" height="4" rx="2" fill="#fff" opacity="0.2" />

        {/* 팔 — 오른쪽 팔이 인사합니다. */}
        <g className="blot-arm">
          <path
            d="M45 42q6-1 8-6"
            stroke="url(#blot-limb)"
            strokeWidth="4.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="54" cy="34" r="3.4" fill="#8ebae4" />
        </g>
        {/* 왼팔은 가만히 내려두어야 오른팔이 인사하는 게 눈에 들어옵니다. */}
        <path
          d="M19 43q-5 2-6 7"
          stroke="url(#blot-limb)"
          strokeWidth="4.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="12.6" cy="51.5" r="3.4" fill="#6f9cc7" />

        {/* 머리 */}
        <rect x="13" y="11" width="38" height="29" rx="10.5" fill="url(#blot-head)" />
        {/* 머리 위쪽에 걸리는 빛 */}
        <rect x="16.5" y="13.5" width="31" height="9" rx="4.5" fill="#fff" opacity="0.22" />

        {/* 얼굴 화면 */}
        <rect x="18.5" y="18" width="27" height="17" rx="7" fill="url(#blot-face)" />
        <circle cx="26" cy="26" r="2.9" fill="#e8f2ff" />
        <circle cx="38" cy="26" r="2.9" fill="#e8f2ff" />
        <circle cx="26.9" cy="25.1" r="0.9" fill="#20364d" opacity="0.55" />
        <circle cx="38.9" cy="25.1" r="0.9" fill="#20364d" opacity="0.55" />
        <path
          d="M27.5 30.5q4.5 3 9 0"
          stroke="#e8f2ff"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
