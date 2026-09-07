'use client'

import { useState, useTransition } from 'react'
import { regenerateSummary } from '@/lib/actions/blot'

export function BlotSummary({
  postId,
  slug,
  summary,
  isAdmin,
}: {
  postId: string
  slug: string
  summary: string | null
  isAdmin: boolean
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // 요약도 없고 주인도 아니면 아무것도 보여주지 않습니다.
  if (!summary && !isAdmin) return null

  function regenerate() {
    setMessage(null)
    startTransition(async () => {
      const result = await regenerateSummary({ postId, slug })
      setMessage('error' in result ? result.error : result.message)
    })
  }

  return (
    <aside className="mb-10 rounded-xl border border-accent/20 bg-accent-soft px-5 py-4">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-xs font-bold tracking-wide text-accent font-mono">blot</span>
        {isAdmin && (
          <button
            type="button"
            onClick={regenerate}
            disabled={isPending}
            className="text-xs text-muted hover:text-foreground disabled:opacity-40"
          >
            {isPending ? '만드는 중…' : summary ? '다시 만들기' : '요약 만들기'}
          </button>
        )}
      </div>

      {summary ? (
        <p className="text-sm leading-relaxed text-foreground/85">{summary}</p>
      ) : (
        <p className="text-sm text-muted">아직 요약이 없습니다.</p>
      )}

      {message && <p className="mt-2 text-xs text-muted">{message}</p>}
    </aside>
  )
}
