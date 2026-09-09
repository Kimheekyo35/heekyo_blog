import Image from 'next/image'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'
import { firstImage } from '@/lib/posts'
import type { DesktopItemRow, Spots } from '@/lib/desktop'
import { removeDesktopItem } from '@/lib/actions/desktop'
import type { PostListItem } from '@/components/post-list'
import type { Profile } from '@/lib/profile'
import { BlotIcon } from '@/components/blot-icon'
import { FolderIcon, DocIcon, PencilIcon } from '@/components/desktop/icons'
import {
  lift,
  shadow,
  photo,
  tile,
  label as labelClass,
  labelFile,
} from '@/components/desktop/styles'
import { DesktopSurface, DesktopItem } from '@/components/desktop/desktop-surface'
import { DesktopAdder } from '@/components/desktop/desktop-adder'
import { ProfileWindow } from '@/components/desktop/profile-window'
import {
  CalendarProvider,
  CalendarButton,
  CalendarFile,
  type CalendarPost,
} from '@/components/desktop/desktop-calendar'

/*
  홈 = 바탕화면. 이 화면이 전부이고, 글은 폴더나 달력을 거쳐 찾아갑니다.
  넓은 화면에서는 아이콘이 사방에 흩어져 있고, 좁은 화면에서는 가운데로 모여
  위에서 아래로 쌓입니다(globals.css의 .desktop-item 참고).

  아래 좌표는 "처음 놓이는 자리"일 뿐입니다. 주인이 끌어서 옮기면 그 자리가
  DesktopSpot에 저장되고, 다음부터는 저장된 자리가 이깁니다.
*/

function CategoryFolder({ slug, label }: { slug: string; label: string }) {
  return (
    <Link href={`/category/${slug}`} className={lift}>
      <FolderIcon className={`w-full ${shadow}`} />
      <span className={`${labelClass} text-[13px]`}>{label}</span>
    </Link>
  )
}

/** 글 하나 = 파일 하나. 사진이 있으면 사진을, 없으면 문서 아이콘을 씌웁니다. */
function PostFile({ post, portrait }: { post: PostListItem; portrait?: boolean }) {
  const image = firstImage(post.content)
  // 띄어쓰기를 밑줄로 바꿔 파일 이름처럼 보이게 합니다.
  const name = `${post.title.trim().replace(/\s+/g, '_')}.${image ? 'jpg' : 'txt'}`

  return (
    <Link href={`/posts/${post.slug}`} className={lift} title={post.title}>
      {image ? (
        <div className={`${photo} ${portrait ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
          <Image src={image} alt="" fill sizes="140px" className="object-cover" />
        </div>
      ) : (
        <DocIcon className={`mx-auto w-[76%] ${shadow}`} />
      )}
      <span className={labelFile}>{name}</span>
    </Link>
  )
}

/** 주인이 직접 올려 둔 사진·파일. 주인에게는 치우는 단추가 같이 보입니다. */
function UserItem({ item, isAdmin }: { item: DesktopItemRow; isAdmin: boolean }) {
  return (
    <div className="group relative text-center">
      {item.kind === 'image' && item.imageUrl ? (
        <div className={`${photo} aspect-[4/3]`}>
          <Image src={item.imageUrl} alt={item.label} fill sizes="140px" className="object-cover" />
        </div>
      ) : (
        <DocIcon className={`mx-auto w-[76%] ${shadow}`} />
      )}

      {item.label && (
        <span className="mt-2 line-clamp-2 inline-block max-w-full rounded px-1.5 py-0.5 align-top font-mono text-[11px] leading-tight tracking-tight">
          {item.label}
        </span>
      )}

      {isAdmin && (
        <form
          action={removeDesktopItem.bind(null, item.id)}
          className="absolute -right-1.5 -top-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
        >
          <button
            type="submit"
            title="바탕화면에서 치우기"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs leading-none text-background shadow"
          >
            ×
          </button>
        </form>
      )}
    </div>
  )
}

/** 바탕화면 구석에 놓인, 앱 아이콘처럼 생긴 사각 타일. */
function Tile({
  href,
  label,
  external,
  children,
}: {
  href?: string
  label: string
  external?: boolean
  children: React.ReactNode
}) {
  if (!href) {
    return (
      <div className={tile} title={label} aria-label={label}>
        {children}
      </div>
    )
  }

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${tile} transition-transform duration-200 hover:-translate-y-1`}
    >
      {children}
    </Link>
  )
}

/** 지금 듣는 곡 타일 안에서 흔들리는 소리 막대. */
const TILE_BARS = [
  { h: '45%', duration: '0.9s', delay: '0s' },
  { h: '85%', duration: '1.25s', delay: '0.18s' },
  { h: '62%', duration: '0.75s', delay: '0.06s' },
  { h: '95%', duration: '1.05s', delay: '0.3s' },
]

function TileEqualizer() {
  return (
    <span className="flex h-[44%] w-[46%] items-end justify-center gap-[9%]" aria-hidden>
      {TILE_BARS.map((bar, i) => (
        <span
          key={i}
          className="eq-bar w-[14%] rounded-full bg-accent"
          style={{ height: bar.h, animationDuration: bar.duration, animationDelay: bar.delay }}
        />
      ))}
    </span>
  )
}

export function Desktop({
  posts,
  profile,
  hobbies,
  showProfile,
  isAdmin,
  items,
  spots,
  today,
  calendarPosts,
}: {
  posts: PostListItem[]
  profile: Profile
  hobbies: string[]
  showProfile: boolean
  isAdmin: boolean
  items: DesktopItemRow[]
  spots: Spots
  today: string
  calendarPosts: CalendarPost[]
}) {
  // 파일로 띄울 글은 최신 네 개까지만. 나머지는 폴더와 달력에서 찾습니다.
  const files = posts.slice(0, 4)

  /** 저장해 둔 자리가 있으면 그 자리로, 없으면 처음 정해 둔 자리로. */
  const at = (key: string, x: number, y: number) => ({ spotKey: key, ...(spots[key] ?? { x, y }) })

  return (
    <CalendarProvider today={today} posts={calendarPosts}>
      <DesktopSurface
        editable={isAdmin}
        className="desktop relative w-full px-5 pt-6 pb-10 lg:px-10 lg:py-0"
      >
        {/* 제목은 맨 위 가운데. 큰 폴더가 글자 아랫부분을 살짝 덮습니다. */}
        <DesktopItem {...at('title', 50, 27)} width="min(42rem, 84vw)">
          <div className="flex select-none flex-col items-center">
            <h1 className="text-center font-display text-[clamp(3.4rem,14vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.05em]">
              heekyo
            </h1>

            {/* 큰 폴더도 달력으로 이어집니다. 글은 날짜로 찾아갑니다. */}
            <CalendarButton
              label="달력에서 글 찾기"
              className="relative z-10 -mt-[4%] w-[40%] transition-transform duration-200 hover:-translate-y-1"
            >
              <FolderIcon className={`w-full ${shadow}`} />
            </CalendarButton>

            <span className="mt-3 font-script text-[clamp(1.4rem,3vw,2.2rem)] italic leading-none text-muted">
              ({new Date().getFullYear()})
            </span>
          </div>
        </DesktopItem>

        {/* 흩어진 아이콘들 — 좁은 화면에서는 여기서부터 아래로 쌓입니다. */}
        <div className="desktop-scatter">
          <DesktopItem {...at(`folder:${CATEGORIES[0].slug}`, 9, 37)} rotate={-3}>
            <CategoryFolder {...CATEGORIES[0]} />
          </DesktopItem>
          <DesktopItem {...at(`folder:${CATEGORIES[1].slug}`, 88, 18)} rotate={3}>
            <CategoryFolder {...CATEGORIES[1]} />
          </DesktopItem>
          <DesktopItem {...at(`folder:${CATEGORIES[2].slug}`, 12, 77)} rotate={2}>
            <CategoryFolder {...CATEGORIES[2]} />
          </DesktopItem>

          <DesktopItem {...at('tile:blot', 16, 12)} rotate={-5} width="4.6rem">
            <Tile label="blot — 글을 대신 요약해 주는 로봇">
              <BlotIcon className="w-[58%] text-accent" />
            </Tile>
          </DesktopItem>

          {/* 손그림 달력 — 글 쓴 날을 누르면 그날 글이 나옵니다. */}
          <DesktopItem {...at('file:calendar', 84, 68)} rotate={-2} width="6.5rem">
            <CalendarFile />
          </DesktopItem>

          {profile.musicTitle && (
            <DesktopItem {...at('tile:music', 20, 63)} rotate={4} width="4.6rem">
              <Tile
                label={`지금 듣는 곡 — ${profile.musicTitle}`}
                href={profile.musicUrl ?? undefined}
                external
              >
                <TileEqualizer />
              </Tile>
            </DesktopItem>
          )}

          {showProfile && (
            <DesktopItem {...at('tile:profile', 93, 45)} rotate={-4} width="4.6rem">
              <ProfileWindow profile={profile} hobbies={hobbies} isAdmin={isAdmin} />
            </DesktopItem>
          )}

          {isAdmin && (
            <DesktopItem {...at('tile:write', 6, 58)} rotate={5} width="4.6rem">
              <Tile label="새 글 쓰기" href="/write">
                <PencilIcon className="w-[52%] text-accent" />
              </Tile>
            </DesktopItem>
          )}

          {files.map((post, i) => {
            // 처음 자리는 넷을 골고루 흩어 놓고, 옮기면 그 자리를 기억합니다.
            const spread = [
              { x: 64, y: 66, rotate: -2 },
              { x: 35, y: 68, rotate: -1 },
              { x: 48, y: 85, rotate: 2 },
              { x: 72, y: 86, rotate: -1 },
            ][i]

            return (
              <DesktopItem
                key={post.id}
                {...at(`post:${post.slug}`, spread.x, spread.y)}
                rotate={spread.rotate}
                width="7rem"
              >
                <PostFile post={post} portrait={i === 1} />
              </DesktopItem>
            )
          })}

          {/* 주인이 올려 둔 사진과 파일 */}
          {items.map((item) => (
            <DesktopItem
              key={item.id}
              spotKey={`item:${item.id}`}
              x={item.x}
              y={item.y}
              rotate={item.rotate}
              width={item.kind === 'image' ? '7rem' : '6.5rem'}
            >
              <UserItem item={item} isAdmin={isAdmin} />
            </DesktopItem>
          ))}
        </div>

        {isAdmin && (
          <>
            {/* 주인에게만 보이는 안내. 좁은 화면은 끌기가 없으므로 숨깁니다. */}
            <p className="pointer-events-none absolute bottom-7 left-10 z-10 hidden text-xs text-muted lg:block">
              아이콘을 끌어서 자리를 옮길 수 있어요
            </p>
            <DesktopAdder />
          </>
        )}
      </DesktopSurface>
    </CalendarProvider>
  )
}
