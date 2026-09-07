'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/lib/actions/like'

export function LikeButton({
  postId,
  slug,
  initialLiked,
  initialCount,
}: {
  postId: string
  slug: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // 서버 응답을 기다리지 않고 먼저 반영해 버튼이 즉시 반응하게 합니다.
    const previous = { liked, count }
    setLiked(!liked)
    setCount(count + (liked ? -1 : 1))

    startTransition(async () => {
      const result = await toggleLike({ postId, slug })
      if ('error' in result) {
        setLiked(previous.liked) // 실패하면 되돌립니다.
        setCount(previous.count)
        return
      }
      setLiked(result.liked)
      setCount(result.count)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
        liked
          ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950/30'
          : 'border-border hover:bg-border/40'
      }`}
    >
      <span aria-hidden>{liked ? '♥' : '♡'}</span>
      <span>좋아요 {count}</span>
    </button>
  )
}
