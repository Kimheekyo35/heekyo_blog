// 상단 장식 배너 — 밤하늘에 폭죽이 터지고, 사람들이 앉아서 그걸 보고 있는 그림.
// 전부 SVG라 이미지 파일을 받아오지 않고, 어떤 화면 크기에서도 또렷합니다.

const BURSTS = [
  { cx: 250, cy: 74, r: 44, color: '#ffd166', delay: '0s' },
  { cx: 600, cy: 50, r: 58, color: '#ff8fab', delay: '1.1s' },
  { cx: 930, cy: 86, r: 40, color: '#8ecae6', delay: '2.2s' },
  { cx: 1090, cy: 58, r: 34, color: '#c3f0ca', delay: '3.0s' },
]

/** 중심에서 사방으로 뻗는 불꽃 줄기를 만듭니다. */
function rays(r: number, count = 16) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
      x1: cos * r * 0.3,
      y1: sin * r * 0.3,
      x2: cos * r,
      y2: sin * r,
    }
  })
}

// 앉아서 보고 있는 사람들. lean은 옆 사람에게 기댄 정도입니다.
const PEOPLE = [
  { x: 120, s: 1.0, lean: 0 },
  { x: 163, s: 0.92, lean: -7 },
  { x: 305, s: 1.06, lean: 0 },
  { x: 430, s: 0.95, lean: 0 },
  { x: 468, s: 0.88, lean: 6 },
  { x: 505, s: 0.8, lean: 0 },
  { x: 660, s: 1.0, lean: 0 },
  { x: 800, s: 0.93, lean: 0 },
  { x: 840, s: 1.02, lean: -5 },
  { x: 985, s: 0.97, lean: 0 },
  { x: 1120, s: 0.9, lean: 0 },
]

const STARS = [
  [70, 40], [180, 96], [340, 34], [420, 70], [520, 28], [700, 60],
  [760, 30], [860, 44], [1010, 36], [1150, 92], [250, 130], [980, 120],
]

export function HeroBanner() {
  return (
    <div className="relative h-36 sm:h-48 overflow-hidden bg-[#0a0e24]">
      <svg
        viewBox="0 0 1200 260"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080b1f" />
            <stop offset="55%" stopColor="#1a1440" />
            <stop offset="100%" stopColor="#3a2154" />
          </linearGradient>
          {BURSTS.map((b, i) => (
            <radialGradient key={i} id={`glow-${i}`}>
              <stop offset="0%" stopColor={b.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <rect width="1200" height="260" fill="url(#sky)" />

        {STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 1.6 : 1.1}
            fill="#fff"
            opacity={0.5}
            className="banner-star"
            style={{ animationDelay: `${(i % 5) * 0.7}s` }}
          />
        ))}

        {BURSTS.map((burst, i) => (
          <g
            key={i}
            className="banner-firework"
            style={{ animationDelay: burst.delay, transformOrigin: `${burst.cx}px ${burst.cy}px` }}
          >
            <circle cx={burst.cx} cy={burst.cy} r={burst.r * 1.5} fill={`url(#glow-${i})`} />
            <g transform={`translate(${burst.cx} ${burst.cy})`}>
              {rays(burst.r).map((ray, j) => (
                <g key={j}>
                  <line
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    stroke={burst.color}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <circle cx={ray.x2} cy={ray.y2} r="1.8" fill={burst.color} />
                </g>
              ))}
            </g>
          </g>
        ))}

        {/* 언덕 */}
        <path d="M0 214 Q 300 190 620 208 T 1200 196 L1200 260 L0 260 Z" fill="#120c26" />

        {/* 앉아서 보고 있는 사람들 */}
        <g fill="#05030f">
          {PEOPLE.map((person, i) => (
            <g
              key={i}
              transform={`translate(${person.x} 236) scale(${person.s}) rotate(${person.lean})`}
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
    </div>
  )
}
