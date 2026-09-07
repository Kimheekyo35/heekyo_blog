import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(d)
}

// 본문 HTML에서 태그를 걷어내 목록용 미리보기를 만듭니다.
function preview(html: string, max = 120) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export default async function HomePage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'

  // 관리자에게는 임시저장 글도 함께 보여줍니다.
  const posts = await db.post.findMany({
    where: isAdmin ? undefined : { published: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (posts.length === 0) {
    return (
      <p className="text-muted py-20 text-center">
        아직 쓴 글이 없습니다.
        {isAdmin && (
          <>
            {' '}
            <Link href="/write" className="underline">
              첫 글을 써보세요
            </Link>
            .
          </>
        )}
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {posts.map((post) => (
        <li key={post.id} className="py-6 first:pt-0">
          <Link href={`/posts/${post.slug}`} className="group block">
            <div className="flex items-center gap-2">
              {!post.published && (
                <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted">
                  임시저장
                </span>
              )}
              <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
            </div>
            <p className="mt-1.5 text-muted text-sm leading-relaxed">{preview(post.content)}</p>
            <p className="mt-2 text-xs text-muted">
              {formatDate(post.publishedAt ?? post.createdAt)}
              {' · '}댓글 {post._count.comments}
              {' · '}좋아요 {post._count.likes}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
