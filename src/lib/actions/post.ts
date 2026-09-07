'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

// 화면에서 버튼을 숨기는 것만으로는 막을 수 없습니다. 실제 차단은 여기서 합니다.
async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('글을 쓸 권한이 없습니다.')
  }
  return session.user
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base
  for (let n = 2; ; n++) {
    const found = await db.post.findUnique({ where: { slug }, select: { id: true } })
    if (!found || found.id === excludeId) return slug
    slug = `${base}-${n}`
  }
}

export type SaveResult = { error: string }

export async function savePost(input: {
  id?: string
  title: string
  content: string
  published: boolean
}): Promise<SaveResult | never> {
  const user = await requireAdmin()

  const title = input.title.trim()
  if (!title) return { error: '제목을 입력해 주세요.' }

  // Tiptap은 내용이 비어도 <p></p>를 돌려줍니다. 태그를 걷어내고 진짜 비었는지 봅니다.
  const textOnly = input.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  if (!textOnly) return { error: '내용을 입력해 주세요.' }

  const slug = await uniqueSlug(slugify(title), input.id)

  const post = input.id
    ? await db.post.update({
        where: { id: input.id },
        data: {
          title,
          slug,
          content: input.content,
          published: input.published,
          // 이미 발행한 글을 수정할 때 발행일이 바뀌지 않도록 처음 한 번만 기록합니다.
          publishedAt: input.published ? undefined : null,
        },
      })
    : await db.post.create({
        data: {
          title,
          slug,
          content: input.content,
          published: input.published,
          publishedAt: input.published ? new Date() : null,
          authorId: user.id,
        },
      })

  // 발행 상태로 처음 바뀌는 순간의 발행일을 채웁니다.
  if (input.published && !post.publishedAt) {
    await db.post.update({ where: { id: post.id }, data: { publishedAt: new Date() } })
  }

  revalidatePath('/')
  revalidatePath(`/posts/${post.slug}`)
  redirect(`/posts/${post.slug}`)
}

export async function deletePost(id: string) {
  await requireAdmin()
  await db.post.delete({ where: { id } })
  revalidatePath('/')
  redirect('/')
}
