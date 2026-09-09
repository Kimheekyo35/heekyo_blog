'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/profile'
import { NowPlaying } from '@/components/now-playing'
import { label as labelClass, tile } from '@/components/desktop/styles'

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full text-center transition-transform duration-200 hover:-translate-y-1"
      >
        <span className={tile}>
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={224}
              height={224}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <PersonIcon />
          )}
        </span>
        <span className={`${labelClass} text-[15px]`}>Who Am I</span>
      </button>

      {/* 기울여 놓은 상자 안에서는 fixed가 화면 기준이 아니라서 body로 빼서 그립니다. */}
      {open && createPortal(window_, document.body)}
    </>
  )
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className="w-[52%] text-accent"
      aria-hidden
    >
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1-3.9 3.8-5.8 7.2-5.8s6.2 1.9 7.2 5.8" />
    </svg>
  )
}
