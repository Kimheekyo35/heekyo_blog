'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { PROFILE_ID } from '@/lib/profile'

const LIMITS = {
  name: 40,
  tagline: 80,
  bio: 600,
  hobbies: 200,
  musicTitle: 80,
  musicArtist: 60,
}

/**
 * 화면에서 받은 주소를 그대로 쓰지 않고 검사합니다.
 * javascript: 같은 주소를 링크로 걸면 누른 사람 브라우저에서 코드가 실행됩니다.
 */
function safeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export type ProfileResult = { error: string }

export async function saveProfile(input: {
  name: string
  tagline: string
  bio: string
  hobbies: string
  avatarUrl: string | null
  musicTitle: string
  musicArtist: string
  musicUrl: string
}): Promise<ProfileResult | never> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: '권한이 없습니다.' }

  const musicUrlInput = input.musicUrl.trim()
  const musicUrl = safeUrl(musicUrlInput)
  if (musicUrlInput && !musicUrl) {
    return { error: '음악 주소는 http:// 또는 https:// 로 시작해야 합니다.' }
  }

  const data = {
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    bio: input.bio.trim(),
    // 쉼표 주변 공백과 빈 항목을 정리해서 저장합니다.
    hobbies: input.hobbies
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)
      .join(', '),
    avatarUrl: input.avatarUrl,
    musicTitle: input.musicTitle.trim(),
    musicArtist: input.musicArtist.trim(),
    musicUrl,
  }

  for (const [field, max] of Object.entries(LIMITS)) {
    const value = data[field as keyof typeof LIMITS]
    if (value.length > max) {
      return { error: `내용이 너무 깁니다. (최대 ${max}자)` }
    }
  }

  // 한 줄짜리 표라서 없으면 만들고 있으면 덮어씁니다.
  await db.profile.upsert({
    where: { id: PROFILE_ID },
    create: { id: PROFILE_ID, ...data },
    update: data,
  })

  revalidatePath('/', 'layout')
  redirect('/')
}
