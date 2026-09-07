'use client'

import { useTransition } from 'react'
import { deleteComment } from '@/lib/actions/comment'

export function DeleteCommentButton({ id, slug }: { id: string; slug: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm('이 댓글을 삭제할까요?')) return
        startTransition(async () => {
          const result = await deleteComment({ id, slug })
          if ('error' in result) alert(result.error)
        })
      }}
      className="text-xs text-muted hover:text-red-500 disabled:opacity-40"
    >
      삭제
    </button>
  )
}
