import { db } from '@/lib/db'
import { DEFAULT_FOLDER_COLOR, isFolderColor, type FolderColorName } from '@/lib/folder-colors'

/*
  폴더 = 글 분류. 예전에는 이 파일에 목록을 적어 두었지만, 이제 주인이 바탕화면에서
  직접 만들 수 있어서 DB(Folder 표)에 있습니다. 글은 Post.category 에 폴더의 slug 를 담습니다.
*/

export type Folder = {
  slug: string
  label: string
  tagline: string
  color: FolderColorName
  /** 이 폴더에 든 글 수. 지우기 전에 알려 주는 데 씁니다. */
  posts: number
}

const folderSelect = { slug: true, label: true, tagline: true, color: true } as const

function toFolder(
  row: { slug: string; label: string; tagline: string; color: string },
  posts = 0
): Folder {
  return {
    slug: row.slug,
    label: row.label,
    tagline: row.tagline,
    // 색 이름이 지워졌거나 이상하면 기본색으로 그립니다.
    color: isFolderColor(row.color) ? row.color : DEFAULT_FOLDER_COLOR,
    posts,
  }
}

/** 만든 순서(sort)대로 폴더 전부. 바탕화면과 글쓰기 화면이 같은 순서를 씁니다. */
export async function findFolders(): Promise<Folder[]> {
  const [rows, counts] = await Promise.all([
    db.folder.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      select: folderSelect,
    }),
    db.post.groupBy({ by: ['category'], _count: { _all: true } }),
  ])

  const byCategory = new Map(counts.map((row) => [row.category, row._count._all]))
  return rows.map((row) => toFolder(row, byCategory.get(row.slug) ?? 0))
}

export async function findFolder(slug: string | null | undefined): Promise<Folder | null> {
  if (!slug) return null
  const row = await db.folder.findUnique({ where: { slug }, select: folderSelect })
  return row ? toFolder(row) : null
}

/** 글을 저장할 때 쓰는 확인. 모르는 폴더면 첫 폴더에 넣습니다. */
export async function resolveFolderSlug(value: unknown): Promise<string | null> {
  if (typeof value === 'string' && (await findFolder(value))) return value
  const [first] = await findFolders()
  return first?.slug ?? null
}

/** 글 목록처럼 여러 글의 폴더 이름이 한꺼번에 필요할 때. */
export async function folderLabels(): Promise<Record<string, string>> {
  const folders = await findFolders()
  return Object.fromEntries(folders.map((folder) => [folder.slug, folder.label]))
}
