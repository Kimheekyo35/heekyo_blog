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
 * 폴더를 치웁니다.
 * 안에 글이 있으면 지우지 않고 바탕화면에서만 감춥니다(글을 잃으면 안 되니까요).
 * 빈 폴더는 아주 지웁니다.
 */
export async function removeFolder(slug: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  const posts = await db.post.count({ where: { category: slug } })

  if (posts > 0) {
    const key = `folder:${slug}`
    await db.desktopSpot.upsert({
      where: { key },
      create: { key, x: 50, y: 50, hidden: true },
      update: { hidden: true },
    })
  } else {
    await db.folder.delete({ where: { slug } }).catch(() => null)
  }

  revalidatePath('/', 'layout')
}

/** 폴더 이름을 고칩니다. 주소(slug)는 그대로 두어서 이미 쓴 글의 분류가 흔들리지 않습니다. */
export async function renameFolder(slug: string, label: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  const next = label.trim().slice(0, LABEL_MAX)
  if (!next) return

  await db.folder.update({ where: { slug }, data: { label: next } }).catch(() => null)
  revalidatePath('/', 'layout')
}
