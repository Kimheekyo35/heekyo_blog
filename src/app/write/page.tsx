import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PostForm } from '@/components/post-form'
import { findFolders } from '@/lib/categories'
import { Container } from '@/components/container'

export const metadata = { title: '새 글 쓰기' }

export default async function WritePage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const folders = await findFolders()

  return (
    <Container>
      <PostForm folders={folders} />
    </Container>
  )
}
