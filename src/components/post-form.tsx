'use client'

import { useRef, useState, useTransition } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { Editor } from '@/components/editor'
import { savePost } from '@/lib/actions/post'

export function PostForm({
  post,
}: {
  post?: { id: string; title: string; content: string; published: boolean }
}) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const editorRef = useRef<TiptapEditor | null>(null)

  function submit(published: boolean) {
    setError(null)
    const content = editorRef.current?.getHTML() ?? ''

    startTransition(async () => {
      const result = await savePost({ id: post?.id, title, content, published })
      // 저장에 성공하면 서버가 글 페이지로 보내므로, 값이 돌아왔다면 실패한 것입니다.
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full text-3xl font-bold bg-transparent outline-none placeholder:text-muted/60"
      />

      <Editor
        initialContent={post?.content}
        onReady={(editor) => {
          editorRef.current = editor
        }}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={isPending}
          className="px-4 py-2 rounded-md bg-foreground text-background text-sm hover:opacity-85 disabled:opacity-50"
        >
          {isPending ? '저장 중…' : post?.published ? '수정 발행' : '발행하기'}
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={isPending}
          className="px-4 py-2 rounded-md border border-border text-sm hover:bg-border/40 disabled:opacity-50"
        >
          임시저장
        </button>
      </div>
    </div>
  )
}
