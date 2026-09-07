// 제목에서 URL 주소(slug)를 만듭니다. 한글은 그대로 둡니다.
// 예: "첫 글을 씁니다!" -> "첫-글을-씁니다"
export function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // 글자·숫자·공백·하이픈만 남김
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  // 제목이 기호뿐이라 남는 글자가 없을 때를 대비한 대비책
  return base || `post-${Date.now().toString(36)}`
}
