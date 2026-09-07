import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { LikeButton } from '@/components/like-button'
import { LoginButton } from '@/components/login-button'
import { CommentSection } from '@/components/comment-section'

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(d)
}

export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const session = await auth()
  const me = session?.user
  const isAdmin = me?.role === 'ADMIN'

  const post = await db.post.findUnique({
    where: { slug: decodedSlug },
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true } },
      // 내가 이미 좋아요를 눌렀는지만 확인합니다.
      likes: me?.id ? { where: { userId: me.id }, select: { id: true } } : false,
    },
  })

  // 임시저장 글은 관리자에게만 보입니다.
  if (!post || (!post.published && !isAdmin)) notFound()

  const likedByMe = Array.isArray(post.likes) && post.likes.length > 0

  return (
    <article>
      <header className="mb-8">
        {!post.published && (
          <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted">
            임시저장
          </span>
        )}
        <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <span>{post.author.name ?? '익명'}</span>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          {isAdmin && (
            <Link href={`/write/${post.id}`} className="underline hover:text-foreground">
              수정
            </Link>
          )}
        </div>
      </header>

      {/*
        본문은 관리자(=나)만 작성하므로 HTML을 그대로 그립니다.
        댓글은 누구나 쓸 수 있으니 절대 이렇게 그리면 안 됩니다.
      */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.published && (
        <>
          <div className="mt-12 flex justify-center">
            {me ? (
              <LikeButton
                postId={post.id}
                slug={decodedSlug}
                initialLiked={likedByMe}
                initialCount={post._count.likes}
              />
            ) : (
              <LoginButton
                redirectTo={`/posts/${decodedSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:bg-border/40"
              >
                <span aria-hidden>♡</span>
                <span>좋아요 {post._count.likes}</span>
              </LoginButton>
            )}
          </div>

          <CommentSection postId={post.id} slug={decodedSlug} />
        </>
      )}
    </article>
  )
}
