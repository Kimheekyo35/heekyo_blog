'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export type LikeResult = { error: string } | { liked: boolean; count: number }

export async function toggleLike(input: { postId: string; slug: string }): Promise<LikeResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: '로그인이 필요합니다.' }

  const userId = session.user.id
  const where = { postId_userId: { postId: input.postId, userId } }

  const existing = await db.like.findUnique({ where, select: { id: true } })

  if (existing) {
    await db.like.delete({ where })
  } else {
    await db.like.create({ data: { postId: input.postId, userId } })
  }

  const count = await db.like.count({ where: { postId: input.postId } })
  revalidatePath(`/posts/${input.slug}`)
  return { liked: !existing, count }
}
