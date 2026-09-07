// 카테고리를 늘리고 싶으면 이 배열에만 추가하면 됩니다. DB 수정은 필요 없습니다.
export const CATEGORIES = [
  {
    slug: 'daily',
    label: '일상',
    tagline: '지나가는 하루를 붙잡아 두는 곳',
  },
  {
    slug: 'howto',
    label: 'How to make',
    tagline: '만드는 방법을 처음부터 끝까지',
  },
] as const

export type Category = (typeof CATEGORIES)[number]
export type CategorySlug = Category['slug']

export const DEFAULT_CATEGORY: CategorySlug = 'daily'

export function findCategory(slug: string | null | undefined): Category | undefined {
  if (!slug) return undefined
  return CATEGORIES.find((c) => c.slug === slug)
}

export function categoryLabel(slug: string | null | undefined) {
  return findCategory(slug)?.label ?? '기타'
}

export function isCategorySlug(value: unknown): value is CategorySlug {
  return typeof value === 'string' && CATEGORIES.some((c) => c.slug === value)
}
