'use client'

import { useRef, useState, useTransition } from 'react'
import { addComment } from '@/lib/actions/comment'

const MAX_LENGTH = 1000

export function CommentForm({ postId, slug }: { postId: string; slug: string }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await addComment({ postId, slug, body })
      if ('error' in result) {
        setError(result.error)
        return
      }
      setBody('')
      textareaRef.current?.focus()
    })
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          // Ctrl+Enter로도 등록되게 (한글 입력 중에는 무시)
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        rows={3}
        maxLength={MAX_LENGTH}
        placeholder="댓글을 남겨보세요"
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-foreground/15"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {body.length}/{MAX_LENGTH}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !body.trim()}
          className="px-4 py-2 rounded-md bg-foreground text-background text-sm hover:opacity-85 disabled:opacity-40"
        >
          {isPending ? '등록 중…' : '댓글 등록'}
        </button>
      </div>
    </div>
  )
}
