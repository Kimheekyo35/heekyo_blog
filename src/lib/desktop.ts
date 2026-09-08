import { db } from '@/lib/db'

/*
  바탕화면에 주인이 올린 사진·파일이 놓이는 자리.
  아이콘을 새로 올릴 때마다 앞에서부터 빈자리를 채웁니다.
  기본 아이콘(폴더·타일·글 파일)이 이미 차지한 곳과 가운데 제목은 피해 둔 좌표입니다.
*/
export type Slot = { x: number; y: number; rotate: number }

export const EXTRA_SLOTS: Slot[] = [
  { x: 48, y: 66, rotate: -3 },
  { x: 77, y: 44, rotate: 3 },
  { x: 93, y: 84, rotate: -2 },
  { x: 28, y: 87, rotate: 4 },
  { x: 24, y: 24, rotate: -5 },
  { x: 76, y: 10, rotate: 2 },
  { x: 6, y: 90, rotate: -4 },
  { x: 62, y: 79, rotate: 3 },
]

/** 이미 쓰고 있는 자리를 빼고 다음 자리를 고릅니다. 다 차면 조금씩 어긋나게 겹칩니다. */
export function pickSlot(taken: { x: number; y: number }[]): Slot {
  const free = EXTRA_SLOTS.find(
    (slot) => !taken.some((t) => Math.abs(t.x - slot.x) < 2 && Math.abs(t.y - slot.y) < 2)
  )
  if (free) return free

  const round = Math.floor(taken.length / EXTRA_SLOTS.length)
  const base = EXTRA_SLOTS[taken.length % EXTRA_SLOTS.length]
  return { ...base, x: base.x + round * 2.5, y: base.y - round * 2.5 }
}

/** 달력에서 쓰는 날짜 열쇠 — "2026-09-08" 꼴. */
export function dateKey(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export type DesktopItemRow = {
  id: string
  kind: string
  imageUrl: string | null
  label: string
  x: number
  y: number
  rotate: number
}

export function findDesktopItems(): Promise<DesktopItemRow[]> {
  return db.desktopItem.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, kind: true, imageUrl: true, label: true, x: true, y: true, rotate: true },
  })
}
