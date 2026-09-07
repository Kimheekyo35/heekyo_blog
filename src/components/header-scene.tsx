// 헤더 배경 장식 — 폭죽이 터지고 사람들이 앉아서 보고 있는 밤 풍경.
// 글자 뒤에 깔리므로 눈에 띄지 않을 만큼만 밝게 그립니다.

const BURSTS = [
  { cx: 210, cy: 36, r: 17, color: '#ffd166', delay: '0s' },
  { cx: 520, cy: 29, r: 21, color: '#ff8fab', delay: '1.4s' },
  { cx: 815, cy: 38, r: 15, color: '#8ecae6', delay: '2.8s' },
]

/** 중심에서 사방으로 뻗는 불꽃 줄기. */
function rays(r: number, count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return { x1: cos * r * 0.32, y1: sin * r * 0.32, x2: cos * r, y2: sin * r }
  })
}

// 앉아서 보고 있는 사람들. lean은 옆 사람에게 기댄 정도입니다.
const PEOPLE = [
  { x: 300, s: 1, lean: 0 },
  { x: 330, s: 0.88, lean: -8 },
  { x: 610, s: 1.05, lean: 0 },
  { x: 880, s: 0.94, lean: 0 },
]

const STARS = [
  [90, 24], [390, 18], [660, 44], [720, 20], [950, 30], [140, 58],
]

export function HeaderScene() {
  return (
    <svg
      viewBox="0 0 1000 104"
      // meet — 잘라내지 않고 전부 보여줍니다. 폭죽이 잘리면 안 되니까요.
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        {BURSTS.map((b, i) => (
          <radialGradient key={i} id={`hdr-glow-${i}`}>
            <stop offset="0%" stopColor={b.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={b.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id="hdr-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b2360" stopOpacity="0" />
          <stop offset="100%" stopColor="#4a2a72" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {STARS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="1.1"
          fill="#fff"
          opacity="0.45"
          className="banner-star"
          style={{ animationDelay: `${(i % 4) * 0.8}s` }}
        />
      ))}

      {BURSTS.map((burst, i) => (
        <g
          key={i}
          className="banner-firework"
          style={{ animationDelay: burst.delay, transformOrigin: `${burst.cx}px ${burst.cy}px` }}
        >
          <circle cx={burst.cx} cy={burst.cy} r={burst.r * 1.6} fill={`url(#hdr-glow-${i})`} />
          <g transform={`translate(${burst.cx} ${burst.cy})`}>
            {rays(burst.r).map((ray, j) => (
              <g key={j}>
                <line
                  x1={ray.x1}
                  y1={ray.y1}
                  x2={ray.x2}
                  y2={ray.y2}
                  stroke={burst.color}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <circle cx={ray.x2} cy={ray.y2} r="1.2" fill={burst.color} opacity="0.9" />
              </g>
            ))}
          </g>
        </g>
      ))}

      {/* 사람들이 앉은 자리. 검은 실루엣이 보이도록 바닥을 살짝 밝힙니다. */}
      <path d="M0 82 Q 250 72 520 80 T 1000 74 L1000 104 L0 104 Z" fill="url(#hdr-ground)" />

      <g fill="#000" opacity="0.92">
        {PEOPLE.map((person, i) => (
          <g
            key={i}
            transform={`translate(${person.x} 104) scale(${person.s * 0.62}) rotate(${person.lean})`}
          >
            {/* 무릎 */}
            <path d="M9 -7 q14 -1 16 7 L9 0 Z" />
            {/* 몸통 */}
            <path d="M-12 0 L-10 -25 Q0 -32 10 -25 L12 0 Z" />
            {/* 머리 */}
            <circle cx="0" cy="-37" r="8" />
          </g>
        ))}
      </g>
    </svg>
  )
}
