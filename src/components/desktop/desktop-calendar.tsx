'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Folder } from '@/lib/categories'
import { labelFile } from '@/components/desktop/styles'

/*
  손으로 그린 느낌의 달력. 홈에서 글을 찾아가는 길입니다.
  달력.cal 파일이나 가운데 큰 폴더를 누르면 열리고,
  글을 쓴 날(점이 찍힌 날)을 누르면 그날 쓴 글이 폴더별로 나뉘어 펼쳐집니다.
  테두리의 흔들림은 globals.css의 .doodle-* 에서 모서리 반지름으로 냅니다.
*/

export type CalendarPost = {
  date: string
  slug: string
  title: string
  category: string | null
}

/** 하루치 글을 폴더별로 나눕니다. 순서는 폴더 목록을 따르고, 글이 없는 폴더는 건너뜁니다. */
function groupByFolder(posts: CalendarPost[], folders: Folder[]) {
  const groups: { label: string; posts: CalendarPost[] }[] = folders
    .map((folder) => ({
      label: folder.label,
      posts: posts.filter((post) => post.category === folder.slug),
    }))
    .filter((group) => group.posts.length > 0)

  // 어느 폴더에도 없는 글(지운 폴더의 글 등)은 맨 끝에 따로 둡니다.
  const known = new Set(folders.map((folder) => folder.slug))
  const rest = posts.filter((post) => !post.category || !known.has(post.category))
  if (rest.length > 0) groups.push({ label: '기타', posts: rest })

  return groups
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 칸마다 조금씩 다른 모양이라야 손으로 그린 것처럼 보입니다. */
const CELL_SHAPES = ['doodle-cell-a', 'doodle-cell-b', 'doodle-cell-c']

function key(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function readableDate(id: string) {
  const [year, month, day] = id.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

// 달력을 여는 단추가 바탕화면 여기저기에 있어서, 여는 방법만 나눠 씁니다.
const OpenCalendar = createContext<(() => void) | null>(null)

/** 바탕화면 전체를 감싸서, 어느 아이콘에서든 달력을 열 수 있게 합니다. */
export function CalendarProvider({
  today,
  posts,
  folders,
  children,
}: {
  today: string
  posts: CalendarPost[]
  folders: Folder[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // 오늘이 든 달에서 시작합니다. today는 서버에서 받은 "YYYY-MM-DD".
  const [year, setYear] = useState(() => Number(today.slice(0, 4)))
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1)

  // 누른 날짜. 그날 쓴 글을 달력 아래에 펼쳐 보여 줍니다.
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const firstWeekday = new Date(year, month, 1).getDay()
  const dayCount = new Date(year, month + 1, 0).getDate()

  function move(step: number) {
    const next = new Date(year, month + step, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
    setPicked(null)
  }

  const byDay = new Map<string, CalendarPost[]>()
  for (const post of posts) {
    const list = byDay.get(post.date)
    if (list) list.push(post)
    else byDay.set(post.date, [post])
  }

  const pickedGroups = groupByFolder(picked ? (byDay.get(picked) ?? []) : [], folders)

  const sheet = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="달력"
        onClick={(e) => e.stopPropagation()}
        className="doodle my-auto w-full max-w-md p-5 font-cute text-[color:var(--ink)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => move(-1)} aria-label="지난달" className="doodle-btn">
            ←
          </button>
          <p className="text-2xl">
            {year}년 {month + 1}월
          </p>
          <button type="button" onClick={() => move(1)} aria-label="다음달" className="doodle-btn">
            →
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 text-center text-sm">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}

          {Array.from({ length: dayCount }, (_, i) => {
            const day = i + 1
            const id = key(year, month, day)
            const written = byDay.get(id)
            const shape = CELL_SHAPES[(day + firstWeekday) % CELL_SHAPES.length]
            const cell = `doodle-cell ${shape} ${picked === id ? 'doodle-cell-picked' : ''}`

            const inner = (
              <>
                <span className="text-base leading-none">{day}</span>
                {written && (
                  <span className="mt-0.5 flex gap-0.5" aria-hidden>
                    {written.slice(0, 3).map((post) => (
                      <span
                        key={post.slug}
                        className="cal-dot h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]"
                      />
                    ))}
                  </span>
                )}
                {id === today && <TodayCircle />}
              </>
            )

            // 글이 있는 날만 누를 수 있습니다. 누르면 아래에 그날 글이 펼쳐집니다.
            return written ? (
              <button
                key={id}
                type="button"
                onClick={() => setPicked((prev) => (prev === id ? null : id))}
                aria-label={`${readableDate(id)}에 쓴 글 ${written.length}개`}
                className={cell}
              >
                {inner}
              </button>
            ) : (
              <span key={id} className={cell}>
                {inner}
              </span>
            )
          })}
        </div>

        {/* 누른 날에 쓴 글 */}
        {picked && (
          <div className="mt-4 border-t-2 border-dashed border-[color:var(--ink)] pt-3">
            <p className="mb-3 text-sm">{readableDate(picked)}에 쓴 글</p>

            {/* 폴더별로 나눠서 보여 줍니다. 글이 없는 폴더는 아예 나오지 않습니다. */}
            <div className="space-y-3">
              {pickedGroups.map((group) => (
                <div key={group.label}>
                  <p className="doodle-folder-label">{group.label}</p>
                  <ul className="mt-1.5 space-y-1.5 pl-1">
                    {group.posts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/posts/${post.slug}`}
                          onClick={() => setOpen(false)}
                          className="doodle-link"
                        >
                          <span aria-hidden>·</span> {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <span className="cal-dot h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]" aria-hidden />
            글 쓴 날 (눌러 보세요)
          </span>
          <button type="button" onClick={() => setOpen(false)} className="doodle-btn">
            닫기
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <OpenCalendar.Provider value={() => setOpen(true)}>
      {children}
      {/*
        달력을 여는 아이콘들은 기울여 놓은 상자 안에 들어 있습니다. 기울인(transform) 부모
        안에서는 fixed가 화면이 아니라 그 부모를 기준으로 잡히므로, 달력은 body로 빼서 그립니다.
      */}
      {open && createPortal(sheet, document.body)}
    </OpenCalendar.Provider>
  )
}

/** 달력을 여는 단추. 안에 무엇을 넣든 누르면 달력이 열립니다. */
export function CalendarButton({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: React.ReactNode
}) {
  const open = useContext(OpenCalendar)
  return (
    <button type="button" onClick={() => open?.()} aria-label={label} className={className}>
      {children}
    </button>
  )
}

/** 바탕화면에 놓이는 달력 파일. */
export function CalendarFile() {
  return (
    <CalendarButton
      label="달력 열기"
      className="group block w-full text-center transition-transform duration-200 hover:-translate-y-1"
    >
      <CalendarFileIcon />
      <span className={labelFile}>달력.cal</span>
    </CalendarButton>
  )
}

/** 오늘 날짜에 손으로 두른 동그라미. */
function TodayCircle() {
  return (
    <svg
      viewBox="0 0 60 52"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <path
        d="M31 4C14 3 4 12 4 25c0 13 12 23 27 23 14 0 25-9 25-22C56 13 46 4 30 4c-4 0-8 1-11 2"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 달력과 같은 손그림 결로 그린 파일 아이콘. */
function CalendarFileIcon() {
  return (
    <svg viewBox="0 0 80 78" className="mx-auto w-[78%]" aria-hidden>
      <g
        fill="none"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 고리 두 개 */}
        <path d="M24 5v11M56 6v11" />
        {/* 몸통 — 반듯하지 않게 그려야 손그림처럼 보입니다. */}
        <path d="M7 18q0-5 5-5h56q5 0 5 5l-1 50q0 5-5 5H12q-5 0-5-5z" fill="var(--paper)" />
        <path d="M8 31h64" />
        {/* 날짜 칸 */}
        <path d="M20 43h9M37 43h9M54 43h8M20 56h9M37 56h9" />
      </g>
      <circle cx="58" cy="56" r="4.5" fill="var(--ink)" />
    </svg>
  )
}
