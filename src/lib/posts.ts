import { db } from '@/lib/db'

export const postListSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  summary: true,
  category: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  _count: { select: { comments: true, likes: true } },
} as const

/** 목록에 쓸 글을 가져옵니다. 임시저장 글은 블로그 주인에게만 보입니다. */
export function findPosts({ isAdmin, category }: { isAdmin: boolean; category?: string }) {
  return db.post.findMany({
    where: {
      ...(isAdmin ? {} : { published: true }),
      ...(category ? { category } : {}),
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    select: postListSelect,
  })
}
