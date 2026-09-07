'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const MAX_LENGTH = 1000

export type CommentResult = { error: string } | { ok: true }

export async function addComment(input: {
  postId: string
  slug: string
  body: string
}): Promise<CommentResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: '로그인이 필요합니다.' }

  const body = input.body.trim()
  if (!body) return { error: '댓글 내용을 입력해 주세요.' }
  if (body.length > MAX_LENGTH) {
    return { error: `댓글은 ${MAX_LENGTH}자까지 쓸 수 있습니다.` }
  }

  // 없는 글이나 아직 발행하지 않은 글에는 댓글을 달 수 없습니다.
  const post = await db.post.findUnique({
    where: { id: input.postId },
    select: { published: true },
  })
  if (!post?.published) return { error: '댓글을 달 수 없는 글입니다.' }

  // body는 순수 텍스트로 저장하고 화면에서도 텍스트로만 그립니다.
  // HTML로 그리면 남이 쓴 스크립트가 실행될 수 있습니다.
  await db.comment.create({
    data: { body, postId: input.postId, authorId: session.user.id },
  })

  revalidatePath(`/posts/${input.slug}`)
  return { ok: true }
}

export async function deleteComment(input: { id: string; slug: string }): Promise<CommentResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: '로그인이 필요합니다.' }

  const comment = await db.comment.findUnique({
    where: { id: input.id },
    select: { authorId: true },
  })
  if (!comment) return { error: '이미 삭제된 댓글입니다.' }

  // 본인 댓글이거나, 블로그 주인이면 지울 수 있습니다.
  const isOwner = comment.authorId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwner && !isAdmin) return { error: '삭제할 권한이 없습니다.' }

  await db.comment.delete({ where: { id: input.id } })
  revalidatePath(`/posts/${input.slug}`)
  return { ok: true }
}
