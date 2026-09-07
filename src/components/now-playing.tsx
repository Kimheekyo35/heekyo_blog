// 지금 듣는 곡. 실제로 소리가 나지는 않고, 무엇을 듣고 있는지만 보여줍니다.
// 막대가 움직여서 재생 중인 느낌을 냅니다.

const BARS = [
  { height: '55%', duration: '0.9s', delay: '0s' },
  { height: '100%', duration: '1.25s', delay: '0.18s' },
  { height: '72%', duration: '0.75s', delay: '0.06s' },
  { height: '92%', duration: '1.05s', delay: '0.3s' },
  { height: '48%', duration: '0.85s', delay: '0.12s' },
]

function Equalizer() {
  return (
    <span className="flex items-end gap-[3px] h-5 w-6 shrink-0" aria-hidden>
      {BARS.map((bar, i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-accent"
          style={{
            height: bar.height,
            animationDuration: bar.duration,
            animationDelay: bar.delay,
          }}
        />
      ))}
    </span>
  )
}

export function NowPlaying({
  title,
  artist,
  url,
}: {
  title: string
  artist: string
  url: string | null
}) {
  if (!title) return null

  const content = (
    <>
      <Equalizer />
      <span className="min-w-0">
        <span className="block text-sm font-medium truncate">{title}</span>
        {artist && <span className="block text-xs text-muted truncate">{artist}</span>}
      </span>
    </>
  )

  const className =
    'flex items-center gap-3 rounded-xl bg-accent-soft px-3.5 py-3 transition-colors'

  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold text-muted mb-2">지금 듣는 곡</h3>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${className} hover:bg-accent/15`}
        >
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </div>
  )
}
