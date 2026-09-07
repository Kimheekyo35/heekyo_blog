'use client'

import { useTransition } from 'react'
import { deletePost } from '@/lib/actions/post'

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        // 되돌릴 수 없는 작업이라 한 번 확인합니다.
        if (!confirm(`"${title}" 글을 삭제할까요?\n댓글과 좋아요도 함께 사라지며 되돌릴 수 없습니다.`)) {
          return
        }
        startTransition(async () => {
          await deletePost(id)
        })
      }}
      className="text-sm text-muted hover:text-red-500 transition-colors disabled:opacity-40"
    >
      {isPending ? '삭제 중…' : '글 삭제'}
    </button>
  )
}
