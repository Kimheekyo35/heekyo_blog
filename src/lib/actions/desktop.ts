'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { pickSlot } from '@/lib/desktop'

const LABEL_MAX = 30

export type DesktopResult = { error: string } | { ok: true }

/** 바탕화면에 사진이나 파일을 하나 올립니다. 자리는 빈 곳으로 잡아 두고, 뒤에 끌어서 옮깁니다. */
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

/**
 * 아이콘을 끌어다 놓은 자리를 기록합니다.
 * key가 "item:…"이면 주인이 올린 것이라 그 줄을 직접 고치고,
 * 나머지(폴더·타일·글 파일)는 DesktopSpot에 자리만 따로 적어 둡니다.
 */
export async function moveDesktopIcon(key: string, x: number, y: number): Promise<DesktopResult> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }

  if (!key || key.length > 200) return { error: '잘못된 아이콘입니다.' }
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { error: '잘못된 자리입니다.' }

  // 화면 밖으로 나가 다시 잡을 수 없게 되는 것을 막습니다.
  const safeX = Math.min(98, Math.max(2, x))
  const safeY = Math.min(97, Math.max(3, y))

  if (key.startsWith('item:')) {
    const id = key.slice('item:'.length)
    await db.desktopItem.update({ where: { id }, data: { x: safeX, y: safeY } }).catch(() => null)
  } else {
    await db.desktopSpot.upsert({
      where: { key },
      create: { key, x: safeX, y: safeY },
      update: { x: safeX, y: safeY },
    })
  }

  revalidatePath('/')
  return { ok: true }
}

/**
 * 바탕화면을 처음 배치로 되돌립니다. 옮겨 둔 자리와 치워 둔 것이 모두 사라집니다.
 * 올린 사진·파일과 폴더 자체는 그대로입니다.
 */
export async function resetDesktopSpots() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  await db.desktopSpot.deleteMany()
  revalidatePath('/')
}

/** 아이콘 하나를 바탕화면에서 치웁니다. 글이나 카테고리 자체는 그대로 있습니다. */
export async function hideDesktopIcon(key: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  if (!key || key.length > 200) return

  await db.desktopSpot.upsert({
    where: { key },
    // 자리를 옮긴 적이 없어도 줄을 만들어야 하므로, 치울 때의 자리는 대충 가운데로 둡니다.
    create: { key, x: 50, y: 50, hidden: true },
    update: { hidden: true },
  })

  revalidatePath('/')
}


/** 올려 둔 사진·파일의 이름표를 고칩니다. */
export async function renameDesktopItem(id: string, label: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  const next = label.trim().slice(0, LABEL_MAX)
  await db.desktopItem.update({ where: { id }, data: { label: next } }).catch(() => null)
  revalidatePath('/')
}
