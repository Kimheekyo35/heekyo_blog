'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { DEFAULT_FOLDER_COLOR, isFolderColor } from '@/lib/folder-colors'

const LABEL_MAX = 20

export type FolderResult = { error: string } | { ok: true }

/** 이미 있는 이름과 겹치지 않는 주소를 만듭니다. "여행" → "여행", 또 만들면 "여행-2". */
async function uniqueSlug(label: string) {
  const base = slugify(label)
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    const taken = await db.folder.findUnique({ where: { slug: candidate }, select: { slug: true } })
    if (!taken) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}

/** 바탕화면에 폴더를 하나 새로 만듭니다. 글쓰기 화면의 분류에도 바로 나옵니다. */
export async function addFolder(input: {
  label: string
  color: string
  tagline?: string
}): Promise<FolderResult> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }

  const label = input.label.trim()
  if (!label) return { error: '폴더 이름을 적어 주세요.' }
  if (label.length > LABEL_MAX) return { error: `이름은 ${LABEL_MAX}자까지 쓸 수 있습니다.` }

  const color = isFolderColor(input.color) ? input.color : DEFAULT_FOLDER_COLOR
  const last = await db.folder.findFirst({ orderBy: { sort: 'desc' }, select: { sort: true } })

  await db.folder.create({
    data: {
      slug: await uniqueSlug(label),
      label,
      tagline: (input.tagline ?? '').trim().slice(0, 80),
      color,
      sort: (last?.sort ?? -1) + 1,
    },
  })

  // 폴더는 여러 화면에 나오므로 전부 새로 그립니다.
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** 폴더 색을 바꿉니다. 그 폴더만 바뀝니다. */
export async function setFolderColor(slug: string, color: string): Promise<FolderResult> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }
  if (!isFolderColor(color)) return { error: '없는 색입니다.' }

  await db.folder.update({ where: { slug }, data: { color } }).catch(() => null)

  revalidatePath('/', 'layout')
  return { ok: true }
}

/**
 * 폴더를 지웁니다. 되돌릴 수 없습니다.
 * 안에 글이 있으면 그 글들은 남은 첫 폴더로 옮깁니다(글을 잃으면 안 되니까요).
 * 남은 폴더가 하나도 없으면 분류 없는 글이 됩니다.
 */
export async function removeFolder(slug: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  const moveTo = await db.folder.findFirst({
    where: { slug: { not: slug } },
    orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    select: { slug: true },
  })

  await db.post.updateMany({
    where: { category: slug },
    data: { category: moveTo?.slug ?? null },
  })

  await db.folder.delete({ where: { slug } }).catch(() => null)
  // 바탕화면에 남아 있던 자리 기록도 같이 치웁니다.
  await db.desktopSpot.delete({ where: { key: `folder:${slug}` } }).catch(() => null)

  revalidatePath('/', 'layout')
}

/**
 * 폴더 이름과 한 줄 설명을 고칩니다.
 * 주소(slug)는 그대로 두어서 이미 쓴 글의 분류가 흔들리지 않습니다.
 */
export async function renameFolder(slug: string, label: string, tagline?: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  const next = label.trim().slice(0, LABEL_MAX)
  if (!next) return

  await db.folder
    .update({
      where: { slug },
      data: {
        label: next,
        ...(tagline === undefined ? {} : { tagline: tagline.trim().slice(0, 80) }),
      },
    })
    .catch(() => null)

  revalidatePath('/', 'layout')
}
