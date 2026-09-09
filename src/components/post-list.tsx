import Link from 'next/link'
import { folderLabels } from '@/lib/categories'

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

// 요약이 있으면 요약을, 없으면 본문 앞부분을 미리보기로 씁니다.
function preview(html: string, max = 140) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export type PostListItem = {
  id: string
  slug: string
  title: string
  content: string
  summary: string | null
  category: string | null
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  _count: { comments: number; likes: number }
}

export async function PostList({ posts }: { posts: PostListItem[] }) {
  const labels = await folderLabels()

  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/posts/${post.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-black/[0.04]"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                {(post.category && labels[post.category]) ?? '기타'}
              </span>
              {!post.published && (
                <span className="text-xs px-2 py-1 rounded-full border border-border text-muted">
                  임시저장
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors">
              {post.title}
            </h2>

            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
              {post.summary ?? preview(post.content)}
            </p>

            <div className="mt-5 flex items-center gap-3 text-xs text-muted">
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span className="ml-auto flex items-center gap-3">
                <span>♡ {post._count.likes}</span>
                <span>💬 {post._count.comments}</span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
