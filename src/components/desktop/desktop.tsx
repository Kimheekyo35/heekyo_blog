import Image from 'next/image'
import Link from 'next/link'
import type { Folder } from '@/lib/categories'
import { firstImage } from '@/lib/posts'
import { EXTRA_SLOTS, type DesktopItemRow, type Spots } from '@/lib/desktop'
import { removeDesktopItem, hideDesktopIcon, renameDesktopItem } from '@/lib/actions/desktop'
import { removeFolder, renameFolder } from '@/lib/actions/folder'
import { FolderColorPicker } from '@/components/desktop/folder-color-picker'
import { RenameButton } from '@/components/desktop/rename-button'
import type { PostListItem } from '@/components/post-list'
import type { Profile } from '@/lib/profile'
import { BlotBubble } from '@/components/desktop/blot-bubble'
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

  아래 좌표는 "처음 놓이는 자리"일 뿐입니다. 주인이 끌어서 옮기거나 치우면
  그것이 DesktopSpot에 저장되고, 다음부터는 저장된 쪽이 이깁니다.
*/

function CategoryFolder({ folder }: { folder: Folder }) {
  return (
    <Link href={`/category/${folder.slug}`} className={lift} draggable={false}>
      {/* folder-<색> 이 이 아이콘 안에서만 폴더 색을 바꿉니다 (globals.css). */}
      <FolderIcon className={`w-full folder-${folder.color} ${shadow}`} />
      <span className={`${labelClass} text-[15px]`}>{folder.label}</span>
    </Link>
  )
}

/** 글 하나 = 파일 하나. 사진이 있으면 사진을, 없으면 문서 아이콘을 씌웁니다. */
function PostFile({ post, portrait }: { post: PostListItem; portrait?: boolean }) {
  const image = firstImage(post.content)
  // 띄어쓰기를 밑줄로 바꿔 파일 이름처럼 보이게 합니다.
  const name = `${post.title.trim().replace(/\s+/g, '_')}.${image ? 'jpg' : 'txt'}`

  return (
    <Link href={`/posts/${post.slug}`} className={lift} title={post.title} draggable={false}>
      {image ? (
        <div className={`${photo} ${portrait ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
          <Image src={image} alt="" fill sizes="140px" className="object-cover" draggable={false} />
        </div>
      ) : (
        <DocIcon className={`mx-auto w-[76%] ${shadow}`} />
      )}
      <span className={labelFile}>{name}</span>
    </Link>
  )
}

/** 주인이 직접 올려 둔 사진·파일. */
function UserItem({ item }: { item: DesktopItemRow }) {
  return (
    <div className="text-center">
      {item.kind === 'image' && item.imageUrl ? (
        <div className={`${photo} aspect-[4/3]`}>
          <Image
            src={item.imageUrl}
            alt={item.label}
            fill
            sizes="140px"
            className="object-cover"
            draggable={false}
          />
        </div>
      ) : (
        <DocIcon className={`mx-auto w-[76%] ${shadow}`} />
      )}

      {item.label && (
        <span className="mt-2 line-clamp-2 inline-block max-w-full rounded px-1.5 py-0.5 align-top text-[14px] leading-tight">
          {item.label}
        </span>
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
      draggable={false}
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

/** 폴더와 글 파일이 처음 놓이는 자리. */
const FOLDER_SPREAD = [
  { x: 9, y: 37, rotate: -3 },
  { x: 88, y: 18, rotate: 3 },
  { x: 12, y: 77, rotate: 2 },
]

const FILE_SPREAD = [
  { x: 64, y: 66, rotate: -2 },
  { x: 35, y: 68, rotate: -1 },
  { x: 48, y: 85, rotate: 2 },
  { x: 72, y: 86, rotate: -1 },
]

export function Desktop({
  posts,
  profile,
  hobbies,
  folders,
  isAdmin,
  items,
  spots,
  today,
  calendarPosts,
}: {
  posts: PostListItem[]
  profile: Profile
  hobbies: string[]
  folders: Folder[]
  isAdmin: boolean
  items: DesktopItemRow[]
  spots: Spots
  today: string
  calendarPosts: CalendarPost[]
}) {
  /** 치워 둔 아이콘인지. */
  const hidden = (key: string) => spots[key]?.hidden === true

  /** 저장해 둔 자리가 있으면 그 자리로, 없으면 처음 정해 둔 자리로. 치우는 단추도 함께. */
  const at = (key: string, x: number, y: number) => ({
    spotKey: key,
    x: spots[key]?.x ?? x,
    y: spots[key]?.y ?? y,
    remove: hideDesktopIcon.bind(null, key),
  })

  // 파일로 띄울 글은 치우지 않은 것 중 최신 네 개까지. 하나를 치우면 다음 글이 올라옵니다.
  const files = posts.filter((post) => !hidden(`post:${post.slug}`)).slice(0, 4)

  return (
    <CalendarProvider today={today} posts={calendarPosts} folders={folders}>
      <DesktopSurface
        editable={isAdmin}
        className="desktop relative w-full px-5 pt-6 pb-10 font-round lg:px-10 lg:py-0"
      >
        {/* 제목은 맨 위 가운데. 큰 폴더가 글자 아랫부분을 살짝 덮습니다. 이건 치울 수 없습니다. */}
        <DesktopItem
          spotKey="title"
          x={spots['title']?.x ?? 50}
          y={spots['title']?.y ?? 27}
          width="min(42rem, 84vw)"
        >
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
          {folders.map((folder, i) => {
            const key = `folder:${folder.slug}`
            if (hidden(key)) return null
            // 폴더가 셋보다 많아지면 빈자리 목록에서 이어서 자리를 줍니다.
            const spread =
              FOLDER_SPREAD[i] ?? EXTRA_SLOTS[(i - FOLDER_SPREAD.length) % EXTRA_SLOTS.length]

            return (
              <DesktopItem
                key={key}
                {...at(key, spread.x, spread.y)}
                rotate={spread.rotate}
                remove={removeFolder.bind(null, folder.slug)}
                removeHint={`'${folder.label}' 폴더를 지울까요? 안에 글이 있으면 지우지 않고 바탕화면에서만 감춥니다.`}
                extra={
                  <>
                    <FolderColorPicker slug={folder.slug} color={folder.color} />
                    <RenameButton
                      label={folder.label}
                      rename={renameFolder.bind(null, folder.slug)}
                    />
                  </>
                }
              >
                <CategoryFolder folder={folder} />
              </DesktopItem>
            )
          })}

          {!hidden('tile:blot') && (
            <DesktopItem {...at('tile:blot', 16, 12)} rotate={-5} width="4.6rem">
              <BlotBubble />
            </DesktopItem>
          )}

          {/* 손그림 달력 — 글 쓴 날을 누르면 그날 글이 나옵니다. */}
          {!hidden('file:calendar') && (
            <DesktopItem {...at('file:calendar', 84, 68)} rotate={-2} width="6.5rem">
              <CalendarFile />
            </DesktopItem>
          )}

          {profile.musicTitle && !hidden('tile:music') && (
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

          {isAdmin && !hidden('tile:write') && (
            <DesktopItem {...at('tile:write', 6, 58)} rotate={5} width="4.6rem">
              <Tile label="새 글 쓰기" href="/write">
                <PencilIcon className="w-[52%] text-accent" />
              </Tile>
            </DesktopItem>
          )}

          {files.map((post, i) => {
            const spread = FILE_SPREAD[i]
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

          {/* 주인이 올려 둔 사진과 파일 — 이건 치우면 아예 지웁니다. */}
          {items.map((item) => (
            <DesktopItem
              key={item.id}
              spotKey={`item:${item.id}`}
              x={item.x}
              y={item.y}
              rotate={item.rotate}
              width={item.kind === 'image' ? '7rem' : '6.5rem'}
              remove={removeDesktopItem.bind(null, item.id)}
              removeHint={
                item.kind === 'image'
                  ? '이 사진을 바탕화면에서 지울까요? 다시 되돌릴 수 없습니다.'
                  : '이 파일을 바탕화면에서 지울까요? 다시 되돌릴 수 없습니다.'
              }
              extra={
                <RenameButton
                  label={item.label}
                  rename={renameDesktopItem.bind(null, item.id)}
                />
              }
            >
              <UserItem item={item} />
            </DesktopItem>
          ))}
        </div>

        {/* 바탕화면을 왔다 갔다 하는 졸라맨. 누르면 소개가 열립니다. */}
        <ProfileWindow profile={profile} hobbies={hobbies} isAdmin={isAdmin} />

        {isAdmin && (
          <>
            {/* 주인에게만 보이는 안내. 좁은 화면은 끌기가 없으므로 숨깁니다. */}
            <p className="pointer-events-none absolute bottom-7 left-10 z-10 hidden text-[15px] text-muted lg:block">
              아이콘을 끌어서 옮기고, × 를 눌러 치울 수 있어요
            </p>
            <DesktopAdder />
          </>
        )}
      </DesktopSurface>
    </CalendarProvider>
  )
}
