import { db } from '@/lib/db'

export const PROFILE_ID = 'singleton'

export type Profile = {
  name: string
  tagline: string
  bio: string
  hobbies: string
  avatarUrl: string | null
  musicTitle: string
  musicArtist: string
  musicUrl: string | null
}

const EMPTY_PROFILE: Profile = {
  name: '',
  tagline: '',
  bio: '',
  hobbies: '',
  avatarUrl: null,
  musicTitle: '',
  musicArtist: '',
  musicUrl: null,
}

/** 소개 정보를 가져옵니다. 아직 한 번도 저장하지 않았으면 빈 값을 돌려줍니다. */
export async function getProfile(): Promise<Profile> {
  const row = await db.profile.findUnique({
    where: { id: PROFILE_ID },
    select: {
      name: true,
      tagline: true,
      bio: true,
      hobbies: true,
      avatarUrl: true,
      musicTitle: true,
      musicArtist: true,
      musicUrl: true,
    },
  })
  return row ?? EMPTY_PROFILE
}

/** "독서, 커피, 등산" 형태로 저장된 취미를 목록으로 바꿉니다. */
export function parseHobbies(hobbies: string): string[] {
  return hobbies
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
}

/** 아무것도 채우지 않은 상태인지 판단합니다. */
export function isProfileEmpty(profile: Profile) {
  return (
    !profile.name &&
    !profile.tagline &&
    !profile.bio &&
    !profile.hobbies &&
    !profile.avatarUrl &&
    !profile.musicTitle
  )
}
