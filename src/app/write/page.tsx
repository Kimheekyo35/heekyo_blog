import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PostForm } from '@/components/post-form'

export const metadata = { title: '새 글 쓰기' }

export default async function WritePage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  return <PostForm />
}
