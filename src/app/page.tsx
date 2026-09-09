import { auth } from '@/auth'
import { findPosts } from '@/lib/posts'
import { getProfile, parseHobbies, isProfileEmpty } from '@/lib/profile'
import { findDesktopItems, findDesktopSpots, dateKey } from '@/lib/desktop'
import { findFolders } from '@/lib/categories'
import { Desktop } from '@/components/desktop/desktop'

export default async function HomePage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [posts, profile, items, spots, folders] = await Promise.all([
    findPosts({ isAdmin }),
    getProfile(),
    findDesktopItems(),
    findDesktopSpots(),
    findFolders(),
  ])

  // 달력에 점을 찍을 날짜들. 날짜 계산은 서버 시간 기준으로 한 번만 합니다.
  const calendarPosts = posts.map((post) => ({
    date: dateKey(post.publishedAt ?? post.createdAt),
    slug: post.slug,
    title: post.title,
    category: post.category,
  }))

  return (
    // 홈은 바탕화면 하나뿐입니다. 글은 폴더나 달력을 눌러서 찾아갑니다.
    <Desktop
      posts={posts}
      profile={profile}
      hobbies={parseHobbies(profile.hobbies)}
      // 아직 아무것도 안 채웠는데 방문자라면 빈 소개를 보여줄 이유가 없습니다.
      showProfile={!isProfileEmpty(profile) || isAdmin}
      isAdmin={isAdmin}
      items={items}
      spots={spots}
      folders={folders}
      today={dateKey(new Date())}
      calendarPosts={calendarPosts}
    />
  )
}
