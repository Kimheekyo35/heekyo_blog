import Link from 'next/link'
import { auth } from '@/auth'
import { findPosts } from '@/lib/posts'
import { getProfile } from '@/lib/profile'
import { findDesktopItems, dateKey } from '@/lib/desktop'
import { Container } from '@/components/container'
import { Desktop } from '@/components/desktop/desktop'
import { PostList } from '@/components/post-list'
import { WithProfileSidebar } from '@/components/profile-card'

export default async function HomePage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [posts, profile, items] = await Promise.all([
    findPosts({ isAdmin }),
    getProfile(),
    findDesktopItems(),
  ])

  // 달력에 점을 찍을 날짜들. 날짜 계산은 서버 시간 기준으로 한 번만 합니다.
  const calendarPosts = posts.map((post) => ({
    date: dateKey(post.publishedAt ?? post.createdAt),
    slug: post.slug,
    title: post.title,
  }))

  return (
    <>
      {/* 첫 화면은 폴더가 흩어져 있는 바탕화면. 글 목록은 그 아래에 있습니다. */}
      <Desktop
        posts={posts}
        profile={profile}
        isAdmin={isAdmin}
        items={items}
        today={dateKey(new Date())}
        calendarPosts={calendarPosts}
      />

      <Container id="posts" className="scroll-mt-20 border-t border-border">
        <div className="mb-8 flex items-baseline gap-3">
          <h2 className="text-xl font-bold">모든 글</h2>
          <span className="font-mono text-xs text-muted">{posts.length}개</span>
        </div>

        <WithProfileSidebar>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-muted">아직 쓴 글이 없습니다.</p>
              {isAdmin && (
                <Link
                  href="/write"
                  className="mt-4 inline-block px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90"
                >
                  첫 글 쓰러 가기
                </Link>
              )}
            </div>
          ) : (
            <PostList posts={posts} />
          )}
        </WithProfileSidebar>
      </Container>
    </>
  )
}
