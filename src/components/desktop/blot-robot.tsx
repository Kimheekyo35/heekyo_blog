/**
 * 손을 흔드는 blot 로봇. 바탕화면 타일에만 씁니다.
 * (글 안이나 꼬리말의 작은 자리에는 선으로만 그린 BlotIcon을 그대로 씁니다.)
 *
 * 하얗고 통통한 풍선 로봇. 진짜 3D 대신 면마다 밝기를 달리한 그라데이션과
 * 바닥 그림자로 입체를 냅니다. 움직임은 globals.css의 .blot-* 에 있습니다.
 */
export function BlotRobot({ className = 'w-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      // 흰 몸이라 테두리가 없으면 밝은 바탕에서 형태가 사라집니다.
      stroke="#1f1f1f"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        {/* 왼쪽 위에서 빛이 든다고 보고 밝기를 정했습니다. 흰 몸이라 그림자가 곧 형태입니다. */}
        <radialGradient id="blot-belly" cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#f3f5f8" />
          <stop offset="100%" stopColor="#d3dae3" />
        </radialGradient>
        <radialGradient id="blot-head-g" cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f5f7fa" />
          <stop offset="100%" stopColor="#d8dee6" />
        </radialGradient>
        <linearGradient id="blot-limb-g" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d5dbe4" />
        </linearGradient>
      </defs>

      {/* 바닥 그림자 — 로봇이 떠 있지 않고 놓여 있어 보이게 합니다. */}
      <ellipse cx="32" cy="59.5" rx="14" ry="2.6" fill="#7d8894" opacity="0.22" stroke="none" />

      <g className="blot-bob">
        {/* 다리 — 몸에 가려지도록 먼저 그립니다. */}
        <rect x="24" y="45" width="7.5" height="14" rx="3.7" fill="url(#blot-limb-g)" />
        <rect x="32.5" y="45" width="7.5" height="14" rx="3.7" fill="url(#blot-limb-g)" />

        {/* 왼팔은 가만히 내려두어야 오른팔이 인사하는 게 눈에 들어옵니다. */}
        <g>
          <path d="M17.5 30q-5.5 6-5 15" strokeWidth="10.8" fill="none" />
          <path
            d="M17.5 30q-5.5 6-5 15"
            stroke="url(#blot-limb-g)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12.6" cy="45.5" r="4.6" fill="#eef1f5" />
        </g>

        {/* 오른팔 — 어깨를 축으로 손을 흔듭니다. */}
        <g className="blot-arm">
          <path d="M46.5 30q6-3.5 8.5-9" strokeWidth="10.8" fill="none" />
          <path
            d="M46.5 30q6-3.5 8.5-9"
            stroke="url(#blot-limb-g)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="55.5" cy="20.5" r="4.6" fill="#f4f6f9" />
        </g>

        {/* 통통한 몸통 */}
        <ellipse cx="32" cy="36" rx="16" ry="15.5" fill="url(#blot-belly)" />
        {/* 배에 걸리는 빛과, 아래쪽으로 도는 그늘 */}
        <ellipse cx="26" cy="29" rx="7.5" ry="5.5" fill="#fff" opacity="0.75" stroke="none" />
        <path
          d="M45 33a15.5 15.5 0 0 1-24 15 16 16 0 0 0 24-15z"
          fill="#c3ccd8"
          opacity="0.45"
          stroke="none"
        />
        {/* 가슴의 작은 동그라미 (심장 표시) */}
        <circle cx="39" cy="27.5" r="3.2" fill="none" strokeWidth="1.1" />

        {/* 안테나 — blot만의 표시라 남겨 둡니다. */}
        <path d="M32 6.5V3.5" strokeWidth="1.7" />
        <circle cx="32" cy="2.6" r="1.9" fill="#dfe5ec" />

        {/* 머리 */}
        <ellipse cx="32" cy="14.5" rx="11.5" ry="9.5" fill="url(#blot-head-g)" />
        <ellipse cx="28" cy="11" rx="4.5" ry="3.2" fill="#fff" opacity="0.8" stroke="none" />

        {/* 얼굴 — 눈 두 개와 웃는 입 */}
        <circle cx="27.4" cy="14.5" r="1.9" fill="#2f3438" stroke="none" />
        <circle cx="36.6" cy="14.5" r="1.9" fill="#2f3438" stroke="none" />
        <circle cx="26.8" cy="13.9" r="0.6" fill="#fff" opacity="0.85" stroke="none" />
        <circle cx="36" cy="13.9" r="0.6" fill="#fff" opacity="0.85" stroke="none" />
        <path
          d="M29.6 18q2.4 1.9 4.8 0"
          stroke="#2f3438"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
