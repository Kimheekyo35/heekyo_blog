import Link from 'next/link'
import { auth } from '@/auth'
import { findPosts } from '@/lib/posts'
import { PostList } from '@/components/post-list'
import { WithProfileSidebar } from '@/components/profile-card'

export default async function HomePage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const posts = await findPosts({ isAdmin })

  return (
    <>
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15]">
          기록하는 게<br />
          <span className="text-accent">가장 확실한 방법</span>
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          일상에서 스쳐 가는 것들과, 무언가를 만들어 가는 과정을 남깁니다.
        </p>
      </section>

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
    </>
  )
}
