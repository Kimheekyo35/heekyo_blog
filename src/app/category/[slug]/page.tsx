import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { findPosts } from '@/lib/posts'
import { PostList } from '@/components/post-list'
import { findFolder, findFolders } from '@/lib/categories'
import { Container } from '@/components/container'

// 폴더는 주인이 만들 수 있으므로 그때그때 DB에서 읽습니다.
export async function generateStaticParams() {
  const folders = await findFolders()
  return folders.map((folder) => ({ slug: folder.slug }))
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const folder = await findFolder(decodeURIComponent(slug))
  return { title: folder?.label ?? '폴더' }
}

export default async function CategoryPage({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const folder = await findFolder(decodeURIComponent(slug))
  if (!folder) notFound()

  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const posts = await findPosts({ isAdmin, category: folder.slug })

  return (
    <Container>
      <section className="mb-10">
        <h1 className="text-3xl font-bold">{folder.label}</h1>
        <p className="mt-2 text-muted">{folder.tagline}</p>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted">
          이 폴더에는 아직 글이 없습니다.
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </Container>
  )
}
