import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/auth'
import { getProfile, parseHobbies, isProfileEmpty } from '@/lib/profile'

export async function ProfileCard() {
  const [session, profile] = await Promise.all([auth(), getProfile()])
  const isAdmin = session?.user?.role === 'ADMIN'
  const hobbies = parseHobbies(profile.hobbies)
  const empty = isProfileEmpty(profile)

  // 아직 아무것도 안 채웠는데 방문자라면 빈 칸을 보여줄 이유가 없습니다.
  if (empty && !isAdmin) return null

  return (
    <aside className="rounded-2xl border border-border bg-surface p-6">
      {empty ? (
        <div className="text-center">
          <p className="text-sm text-muted mb-3">아직 소개를 채우지 않았습니다.</p>
          <Link
            href="/profile/edit"
            className="inline-block px-3.5 py-1.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90"
          >
            소개 작성하기
          </Link>
        </div>
      ) : (
        <>
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name || '프로필 사진'}
              width={224}
              height={224}
              className="w-28 h-28 mx-auto rounded-full object-cover"
            />
          ) : (
            <div className="w-28 h-28 mx-auto rounded-full bg-border" aria-hidden />
          )}

          {profile.name && (
            <h2 className="mt-4 text-center text-lg font-bold">{profile.name}</h2>
          )}
          {profile.tagline && (
            <p className="mt-1 text-center text-sm text-accent">{profile.tagline}</p>
          )}

          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed text-muted whitespace-pre-wrap break-words">
              {profile.bio}
            </p>
          )}

          {hobbies.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold text-muted mb-2">취미</h3>
              <ul className="flex flex-wrap gap-1.5">
                {hobbies.map((hobby) => (
                  <li
                    key={hobby}
                    className="text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent"
                  >
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isAdmin && (
            <Link
              href="/profile/edit"
              className="mt-5 block text-center text-xs text-muted hover:text-foreground"
            >
              소개 수정
            </Link>
          )}
        </>
      )}
    </aside>
  )
}

/** 목록 화면에서 왼쪽에 소개, 오른쪽에 글을 놓는 배치. */
export function WithProfileSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* 좁은 화면에서는 글이 먼저 보이도록 소개를 아래로 내립니다. */}
      <div className="order-2 lg:order-1 lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-32">
          <ProfileCard />
        </div>
      </div>
      <div className="order-1 lg:order-2 min-w-0 flex-1">{children}</div>
    </div>
  )
}
