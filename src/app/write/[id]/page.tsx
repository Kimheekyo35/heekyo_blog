import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { PostForm } from '@/components/post-form'

export const metadata = { title: '글 수정' }

export default async function EditPostPage({ params }: PageProps<'/write/[id]'>) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const { id } = await params
  const post = await db.post.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, published: true },
  })
  if (!post) notFound()

  return <PostForm post={post} />
}
