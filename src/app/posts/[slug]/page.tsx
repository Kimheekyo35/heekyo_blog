import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { categoryLabel, findCategory } from '@/lib/categories'
import { LikeButton } from '@/components/like-button'
import { LoginButton } from '@/components/login-button'
import { CommentSection } from '@/components/comment-section'
import { BlotSummary } from '@/components/blot-summary'
import { ImageLightbox } from '@/components/image-lightbox'

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(d)
}

export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params
  const post = await db.post.findUnique({
    where: { slug: decodeURIComponent(slug) },
    select: { title: true, summary: true, published: true },
  })
  if (!post?.published) return { title: '글' }
  return { title: post.title, description: post.summary ?? undefined }
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
  const category = findCategory(post.category)

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          {category ? (
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent hover:opacity-80"
            >
              {category.label}
            </Link>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent">
              {categoryLabel(post.category)}
            </span>
          )}
          {!post.published && (
            <span className="text-xs px-2 py-1 rounded-full border border-border text-muted">
              임시저장
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{post.title}</h1>

        <div className="mt-5 flex items-center gap-3 text-sm text-muted">
          <span>{post.author.name ?? '익명'}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          {isAdmin && (
            <Link
              href={`/write/${post.id}`}
              className="ml-auto text-accent hover:underline"
            >
              수정
            </Link>
          )}
        </div>
      </header>

      {post.published && (
        <BlotSummary
          postId={post.id}
          slug={decodedSlug}
          summary={post.summary}
          isAdmin={isAdmin}
        />
      )}

      {/*
        본문은 관리자(=나)만 작성하므로 HTML을 그대로 그립니다.
        댓글은 누구나 쓸 수 있으니 절대 이렇게 그리면 안 됩니다.
      */}
      <div
        className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <ImageLightbox />

      {post.published && (
        <>
          <div className="mt-14 flex justify-center">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm hover:border-accent/50 hover:text-accent transition-colors"
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
