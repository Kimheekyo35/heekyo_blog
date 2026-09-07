import 'dotenv/config'
import { db } from '../src/lib/db'
import { ensureSummary } from '../src/lib/blot'

/**
 * 발행된 글 중 요약이 없거나 오래된 것을 찾아 한 번에 만들어 줍니다.
 *
 *   npm run blot:backfill
 *
 * 이미 최신 요약이 있는 글은 ensureSummary가 알아서 건너뛰므로
 * 여러 번 돌려도 API 비용이 중복으로 나가지 않습니다.
 */
async function main() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true },
  })

  if (posts.length === 0) {
    console.log('발행된 글이 없습니다.')
    return
  }

  console.log(`발행된 글 ${posts.length}개를 확인합니다.\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const post of posts) {
    const result = await ensureSummary(post.id)
    switch (result.status) {
      case 'created':
        created++
        console.log(`  [생성] ${post.title}`)
        break
      case 'skipped':
        skipped++
        console.log(`  [건너뜀] ${post.title} — ${result.reason}`)
        break
      case 'failed':
        failed++
        console.log(`  [실패] ${post.title} — ${result.reason}`)
        break
    }
  }

  console.log(`\n생성 ${created} / 건너뜀 ${skipped} / 실패 ${failed}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
