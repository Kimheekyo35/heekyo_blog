'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { ensureSummary } from '@/lib/blot'

/** 요약이 실패했거나 마음에 들지 않을 때 다시 만듭니다. 블로그 주인만 쓸 수 있습니다. */
export async function regenerateSummary(input: {
  postId: string
  slug: string
}): Promise<{ error: string } | { ok: true; message: string }> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }

  // 기존 값을 지워서 "최신 요약이 있음" 판정을 건너뛰게 합니다.
  await db.post.update({
    where: { id: input.postId },
    data: { summaryHash: null },
  })

  const result = await ensureSummary(input.postId)
  revalidatePath(`/posts/${input.slug}`)

  if (result.status === 'created') return { ok: true, message: '요약을 새로 만들었습니다.' }
  if (result.status === 'failed') return { error: result.reason }
  return { ok: true, message: result.reason }
}
