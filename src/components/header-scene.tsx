// 헤더 배경 장식 — 폭죽이 터지고 사람들이 앉아서 보고 있는 밤 풍경.
// 글자 뒤에 깔리므로 눈에 띄지 않을 만큼만 밝게 그립니다.

const BURSTS = [
  { cx: 210, cy: 36, r: 17, color: '#ffd166', delay: '0s' },
  { cx: 520, cy: 29, r: 21, color: '#ff8fab', delay: '1.4s' },
  { cx: 815, cy: 38, r: 15, color: '#8ecae6', delay: '2.8s' },
]

// 수양버들형 — 사방으로 퍼진 뒤 아래로 흘러내리는 불꽃. 위의 것들과 모양이 다릅니다.
const WILLOW = { cx: 380, cy: 30, r: 14, color: '#c9f2b0', delay: '2.1s' }

/** 중심에서 사방으로 곧게 뻗는 불꽃 줄기. */
function rays(r: number, count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return { x1: cos * r * 0.32, y1: sin * r * 0.32, x2: cos * r, y2: sin * r }
  })
}

/** 퍼졌다가 중력에 끌려 아래로 처지는 궤적. */
function willowTrails(r: number, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const midX = cos * r * 0.62
    const midY = sin * r * 0.62
    const endX = cos * r * 0.95
    const endY = sin * r * 0.95 + r * 0.6 // 아래로 흘러내림
    return { d: `M0 0 Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`, endX, endY }
  })
}

/**
 * 앉아서 보고 있는 사람들.
 * - coat/knee: 옷 색. 전부 검정이면 어두운 배경에 묻혀 사람으로 안 보입니다.
 * - hair: 머리색. 배경보다 확실히 밝아야 얼굴 위치가 읽힙니다.
 * - lean: 옆 사람에게 기댄 정도
 */
const PEOPLE = [
  { x: 296, s: 1, lean: 0, coat: '#f2836b', knee: '#d96a52', hair: '#a9714b' },
  // 옆 사람에게 기대앉아 손을 들고 환호하는 사람
  { x: 328, s: 0.88, lean: -8, coat: '#6fc2b4', knee: '#54a89a', hair: '#e0aa72', arm: true },
  // 털모자를 쓴 사람
  { x: 610, s: 1.05, lean: 0, coat: '#f0c454', knee: '#d6a93a', hair: '#8d5f42', hat: '#e26d5c' },
  { x: 880, s: 0.94, lean: 0, coat: '#a98fe0', knee: '#8f75c8', hair: '#d8a878' },
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
        <radialGradient id="hdr-glow-willow">
          <stop offset="0%" stopColor={WILLOW.color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={WILLOW.color} stopOpacity="0" />
        </radialGradient>
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

      <g
        className="banner-firework"
        style={{
          animationDelay: WILLOW.delay,
          transformOrigin: `${WILLOW.cx}px ${WILLOW.cy}px`,
        }}
      >
        <circle cx={WILLOW.cx} cy={WILLOW.cy} r={WILLOW.r * 1.8} fill="url(#hdr-glow-willow)" />
        <g transform={`translate(${WILLOW.cx} ${WILLOW.cy})`}>
          {willowTrails(WILLOW.r).map((trail, i) => (
            <g key={i}>
              <path
                d={trail.d}
                stroke={WILLOW.color}
                strokeWidth="0.9"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              <circle cx={trail.endX} cy={trail.endY} r="1.3" fill={WILLOW.color} opacity="0.95" />
            </g>
          ))}
        </g>
      </g>

      <g>
        {PEOPLE.map((person, i) => (
          <g
            key={i}
            transform={`translate(${person.x} 104) scale(${person.s * 0.62}) rotate(${person.lean})`}
          >
            {/* 들어 올린 팔 — 몸통보다 먼저 그려서 어깨 뒤에서 나오게 */}
            {person.arm && (
              <>
                <path
                  d="M8 -24 L19 -46"
                  stroke={person.coat}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="19.5" cy="-47" r="3" fill={person.hair} />
              </>
            )}

            {/* 무릎 — 몸통보다 한 톤 어둡게 해서 앉은 자세가 드러나게 */}
            <path d="M9 -7 q14 -1 16 7 L9 0 Z" fill={person.knee} />
            {/* 몸통(옷) */}
            <path d="M-12 0 L-10 -25 Q0 -32 10 -25 L12 0 Z" fill={person.coat} />
            {/* 머리 */}
            <circle cx="0" cy="-37" r="8" fill={person.hair} />

            {/* 털모자 */}
            {person.hat && (
              <>
                <path d="M-8.4 -38 a8.4 8.4 0 0 1 16.8 0 Z" fill={person.hat} />
                <rect x="-9.2" y="-39.6" width="18.4" height="3.6" rx="1.8" fill={person.hat} />
                <circle cx="0" cy="-48.6" r="2.6" fill={person.hat} />
              </>
            )}
          </g>
        ))}
      </g>
    </svg>
  )
}
