'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { pickSlot } from '@/lib/desktop'

const LABEL_MAX = 30

export type DesktopResult = { error: string } | { ok: true }

/** 바탕화면에 사진이나 파일을 하나 올립니다. 자리는 빈 곳으로 알아서 정합니다. */
export async function addDesktopItem(input: {
  kind: 'image' | 'note'
  imageUrl?: string | null
  label: string
}): Promise<DesktopResult> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }

  const label = input.label.trim()
  if (label.length > LABEL_MAX) return { error: `이름은 ${LABEL_MAX}자까지 쓸 수 있습니다.` }

  // 사진 주소는 우리 서버에 올린 것만 받습니다. 바깥 주소를 그대로 받으면
  // 남의 서버 사진이 내 바탕화면에 걸리게 됩니다.
  const imageUrl = input.kind === 'image' ? (input.imageUrl ?? '') : null
  if (imageUrl !== null && !imageUrl.startsWith('/api/uploads/')) {
    return { error: '사진을 먼저 올려 주세요.' }
  }
  if (input.kind === 'note' && !label) {
    return { error: '파일 이름을 적어 주세요.' }
  }

  const taken = await db.desktopItem.findMany({ select: { x: true, y: true } })
  const slot = pickSlot(taken)

  await db.desktopItem.create({
    data: { kind: input.kind, imageUrl, label, x: slot.x, y: slot.y, rotate: slot.rotate },
  })

  revalidatePath('/')
  return { ok: true }
}

/** 바탕화면에서 치웁니다. 올린 사진 파일 자체는 남겨 둡니다(글에서 쓰고 있을 수 있으니). */
export async function removeDesktopItem(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  await db.desktopItem.delete({ where: { id } }).catch(() => null)
  revalidatePath('/')
}
