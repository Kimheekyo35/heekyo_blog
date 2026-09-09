'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/profile'
import { NowPlaying } from '@/components/now-playing'

/*
  바탕화면의 얼굴 타일. 누르면 소개가 창처럼 열립니다.
  (글 목록 옆에 있던 소개 칸이 이 창으로 옮겨 왔습니다.)
*/
export function ProfileWindow({
  profile,
  hobbies,
  isAdmin,
}: {
  profile: Profile
  hobbies: string[]
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)

  // 소개를 하나도 안 채웠는지. 빈 카드만 뜨는 것을 막는 데 씁니다.
  const empty =
    !profile.name &&
    !profile.tagline &&
    !profile.bio &&
    !profile.avatarUrl &&
    !profile.musicTitle &&
    hobbies.length === 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const window_ = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Who Am I"
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20"
      >
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
                className="h-20 w-20 rounded-full object-cover ring-4 ring-surface"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-border ring-4 ring-surface" aria-hidden />
            )}
          </div>

          {profile.name && <h2 className="text-center text-lg font-bold">{profile.name}</h2>}
          {profile.tagline && (
            <p className="mt-1 text-center text-sm text-accent">{profile.tagline}</p>
          )}

          {/* 아직 아무것도 안 채웠을 때 빈 카드만 뜨지 않도록 */}
          {empty && (
            <p className="text-center text-sm text-muted">
              {isAdmin ? '아직 소개를 채우지 않았습니다.' : '아직 소개가 없습니다.'}
            </p>
          )}

          {profile.bio && (
            <>
              <hr className="my-4 border-border" />
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                {profile.bio}
              </p>
            </>
          )}

          {hobbies.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold text-muted">취미</h3>
              <ul className="flex flex-wrap gap-1.5">
                {hobbies.map((hobby) => (
                  <li
                    key={hobby}
                    className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
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

          <div className="mt-5 flex items-center justify-between text-xs">
            {isAdmin ? (
              <Link href="/profile/edit" className="text-muted hover:text-foreground">
                소개 수정
              </Link>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/*
        바탕화면 아래쪽을 왔다 갔다 하는 졸라맨. 누르면 소개가 열립니다.
        가리키면 멈추므로(globals.css의 .stroll:hover) 걸어가는 중에도 누르기 쉽습니다.
      */}
      <div className="stroll absolute bottom-3 left-4 z-10 lg:bottom-10 lg:left-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Who Am I — 소개 보기"
          className="relative block w-11 cursor-pointer lg:w-14"
        >
          <Mood />
          {/* 몸만 방향을 바꿉니다(globals.css의 .stroll-face). */}
          <span className="stroll-face block">
            <StickFigure />
          </span>
        </button>
      </div>

      {/* 걸어 다니는 사람 안에서는 fixed가 화면 기준이 아닐 수 있어 body로 빼서 그립니다. */}
      {open && createPortal(window_, document.body)}
    </>
  )
}

/** 머리 위에 떠오르는 것들. 5초마다 차례로 바뀝니다. */
const MOODS = ['♪', '?', '💭', '☕', '✨', '!', '🎧', '📖']

const MOOD_EVERY = 5000

function Mood() {
  const [at, setAt] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setAt((i) => (i + 1) % MOODS.length), MOOD_EVERY)
    return () => clearInterval(timer)
  }, [])

  return (
    <span
      // key가 바뀌면 다시 그려지면서 뿅 하고 떠오르는 움직임이 다시 재생됩니다.
      key={at}
      aria-hidden
      className="mood-pop pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-lg leading-none"
    >
      {MOODS[at]}
    </span>
  )
}

/** 걸어 다니는 졸라맨. 팔다리는 관절을 축으로 흔들립니다(globals.css). */
function StickFigure() {
  return (
    <svg
      viewBox="0 0 40 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      className="w-full text-foreground"
      aria-hidden
    >
      {/* 뒤쪽 팔다리를 먼저 그려서 몸 뒤로 지나가게 합니다. */}
      <line className="stick-leg stick-back" x1="20" y1="38" x2="12" y2="55" />
      <line className="stick-arm stick-back" x1="20" y1="23" x2="12" y2="33" />

      <g className="stick-body">
        <circle cx="20" cy="10" r="6.5" />
        <line x1="20" y1="16.5" x2="20" y2="38" />
      </g>

      <line className="stick-leg" x1="20" y1="38" x2="28" y2="55" />
      <line className="stick-arm" x1="20" y1="23" x2="28" y2="33" />
    </svg>
  )
}
