'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

/*
  손으로 그린 느낌의 달력.
  글을 쓴 날에는 칸 아래에 점이 찍히고, 그 칸을 누르면 그날 쓴 글로 갑니다.
  테두리의 흔들림은 globals.css의 .doodle-* 에서 모서리 반지름으로 냅니다.
*/

export type CalendarPost = { date: string; slug: string; title: string }

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function key(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** 칸마다 조금씩 다른 모양이라야 손으로 그린 것처럼 보입니다. */
const CELL_SHAPES = ['doodle-cell-a', 'doodle-cell-b', 'doodle-cell-c']

export function DesktopCalendar({ today, posts }: { today: string; posts: CalendarPost[] }) {
  const [open, setOpen] = useState(false)

  // 오늘이 든 달에서 시작합니다. today는 서버에서 받은 "YYYY-MM-DD".
  const [year, setYear] = useState(() => Number(today.slice(0, 4)))
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1)

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
  }

  const byDay = new Map<string, CalendarPost[]>()
  for (const post of posts) {
    const list = byDay.get(post.date)
    if (list) list.push(post)
    else byDay.set(post.date, [post])
  }

  const sheet = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="달력"
        onClick={(e) => e.stopPropagation()}
        className="doodle w-full max-w-md p-5 font-cute text-[color:var(--ink)]"
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
            const isToday = id === today
            const shape = CELL_SHAPES[(day + firstWeekday) % CELL_SHAPES.length]
            const cell = `doodle-cell ${shape}`

            const inner = (
              <>
                <span className="text-base leading-none">{day}</span>
                {written && (
                  <span className="mt-0.5 flex gap-0.5" aria-hidden>
                    {written.slice(0, 3).map((post) => (
                      <span
                        key={post.slug}
                        className="h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]"
                      />
                    ))}
                  </span>
                )}
                {isToday && <TodayCircle />}
              </>
            )

            return written ? (
              <Link
                key={id}
                href={`/posts/${written[0].slug}`}
                title={written.map((p) => p.title).join(', ')}
                className={cell}
              >
                {inner}
              </Link>
            ) : (
              <span key={id} className={cell}>
                {inner}
              </span>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]" aria-hidden />글 쓴 날
          </span>
          <button type="button" onClick={() => setOpen(false)} className="doodle-btn">
            닫기
          </button>
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
        <CalendarFileIcon />
        <span className="mt-2 inline-block rounded px-1.5 py-0.5 font-mono text-[11px] leading-tight tracking-tight transition-colors group-hover:bg-accent group-hover:text-white">
          달력.cal
        </span>
      </button>

      {/*
        이 아이콘은 기울여 놓은 상자 안에 들어 있습니다. 기울인(transform) 부모 안에서는
        fixed가 화면이 아니라 그 부모를 기준으로 잡히므로, 달력만 body로 빼서 그립니다.
      */}
      {open && createPortal(sheet, document.body)}
    </>
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

/** 바탕화면에 놓이는 달력 파일 아이콘. 달력과 같은 손그림 결로 그립니다. */
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
