import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { findPosts } from '@/lib/posts'
import { PostList } from '@/components/post-list'
import { CATEGORIES, findCategory } from '@/lib/categories'
import { Container } from '@/components/container'

// 카테고리는 고정된 목록이라 미리 만들어 둘 수 있습니다.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const category = findCategory(slug)
  return { title: category?.label ?? '카테고리' }
}

export default async function CategoryPage({ params }: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const category = findCategory(slug)
  if (!category) notFound()

  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const posts = await findPosts({ isAdmin, category: category.slug })

  return (
    <Container>
      <section className="mb-10">
        <h1 className="text-3xl font-bold">{category.label}</h1>
        <p className="mt-2 text-muted">{category.tagline}</p>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted">
          이 카테고리에는 아직 글이 없습니다.
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </Container>
  )
}
