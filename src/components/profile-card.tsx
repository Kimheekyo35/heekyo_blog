import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/auth'
import { getProfile, parseHobbies, isProfileEmpty } from '@/lib/profile'
import { NowPlaying } from '@/components/now-playing'

export async function ProfileCard() {
  const [session, profile] = await Promise.all([auth(), getProfile()])
  const isAdmin = session?.user?.role === 'ADMIN'
  const hobbies = parseHobbies(profile.hobbies)
  const empty = isProfileEmpty(profile)

  // 아직 아무것도 안 채웠는데 방문자라면 빈 칸을 보여줄 이유가 없습니다.
  if (empty && !isAdmin) return null

  if (empty) {
    return (
      <aside className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted mb-3">아직 소개를 채우지 않았습니다.</p>
        <Link
          href="/profile/edit"
          className="inline-block px-3.5 py-1.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90"
        >
          소개 작성하기
        </Link>
      </aside>
    )
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* 사진 뒤로 깔리는 띠 — 폴더 색에서 가져왔습니다. */}
      <div className="h-16 bg-[linear-gradient(115deg,var(--folder-back),var(--folder),var(--accent))]" />

      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4 flex justify-center">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name || '프로필 사진'}
              width={224}
              height={224}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-surface"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-border ring-4 ring-surface" aria-hidden />
          )}
        </div>

        {profile.name && <h2 className="text-center text-lg font-bold">{profile.name}</h2>}
        {profile.tagline && (
          <p className="mt-1 text-center text-sm text-accent">{profile.tagline}</p>
        )}

        {profile.bio && (
          <>
            <hr className="my-4 border-border" />
            <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap break-words">
              {profile.bio}
            </p>
          </>
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

        <NowPlaying
          title={profile.musicTitle}
          artist={profile.musicArtist}
          url={profile.musicUrl}
        />

        {isAdmin && (
          <Link
            href="/profile/edit"
            className="mt-5 block text-center text-xs text-muted hover:text-foreground"
          >
            소개 수정
          </Link>
        )}
      </div>
    </aside>
  )
}

/** 목록 화면에서 왼쪽에 소개, 오른쪽에 글을 놓는 배치. */
export function WithProfileSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div id="about" className="flex scroll-mt-24 flex-col gap-10 lg:flex-row">
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
