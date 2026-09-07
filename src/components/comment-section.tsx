import Image from 'next/image'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CommentForm } from '@/components/comment-form'
import { DeleteCommentButton } from '@/components/delete-comment-button'
import { LoginButton } from '@/components/login-button'

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export async function CommentSection({ postId, slug }: { postId: string; slug: string }) {
  const session = await auth()
  const me = session?.user

  const comments = await db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true, image: true } } },
  })

  return (
    <section className="mt-14 pt-8 border-t border-border">
      <h2 className="text-lg font-semibold mb-5">댓글 {comments.length}</h2>

      {comments.length > 0 && (
        <ul className="space-y-5 mb-8">
          {comments.map((comment) => {
            const canDelete = me && (me.id === comment.author.id || me.role === 'ADMIN')
            return (
              <li key={comment.id} className="flex gap-3">
                {comment.author.image ? (
                  <Image
                    src={comment.author.image}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full shrink-0 h-9 w-9 object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-border shrink-0" aria-hidden />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{comment.author.name ?? '익명'}</span>
                    <span className="text-xs text-muted">{formatDateTime(comment.createdAt)}</span>
                    {canDelete && <DeleteCommentButton id={comment.id} slug={slug} />}
                  </div>
                  {/*
                    댓글은 아무나 쓸 수 있으므로 HTML로 그리지 않고 텍스트로만 그립니다.
                    React가 알아서 이스케이프해 주므로 스크립트가 실행되지 않습니다.
                  */}
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {me ? (
        <CommentForm postId={postId} slug={slug} />
      ) : (
        <div className="rounded-lg border border-border p-5 text-center">
          <p className="text-sm text-muted mb-3">댓글을 쓰려면 로그인이 필요합니다.</p>
          <LoginButton
            redirectTo={`/posts/${slug}`}
            className="px-4 py-2 rounded-md bg-[#03C75A] text-white text-sm font-medium hover:opacity-90"
          >
            네이버로 로그인
          </LoginButton>
        </div>
      )}
    </section>
  )
}
