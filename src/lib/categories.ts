// 카테고리를 늘리고 싶으면 이 배열에만 추가하면 됩니다. DB 수정은 필요 없습니다.
// 홈 화면의 폴더도 이 순서 그대로 놓입니다.
export const CATEGORIES = [
  {
    slug: 'daily',
    label: '일상',
    tagline: '지나가는 하루를 붙잡아 두는 곳',
  },
  {
    slug: 'study',
    label: '공부',
    tagline: '배운 것을 잊어버리기 전에',
  },
  {
    slug: 'dev',
    label: '개발기록',
    tagline: '만드는 과정을 처음부터 끝까지',
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
