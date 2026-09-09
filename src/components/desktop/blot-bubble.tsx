'use client'

import { useEffect, useRef, useState } from 'react'
import { BlotIcon } from '@/components/blot-icon'
import { tile } from '@/components/desktop/styles'

/**
 * blot 로봇 타일. 누르면 말풍선으로 무엇을 하는 아이인지 알려 줍니다.
 * (가리키면 뜨는 브라우저 기본 설명은 쓰지 않습니다.)
 */
export function BlotBubble() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // 바깥을 누르면 닫습니다.
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label="blot이 무엇인지 보기"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${tile} transition-transform duration-200 hover:-translate-y-1`}
      >
        <BlotIcon className="w-[58%] text-accent" />
      </button>

      {open && (
        // 말풍선. 아이콘 아래에 붙고, 꼬리가 로봇을 가리킵니다.
        <div
          className="desktop-popover absolute left-1/2 top-[calc(100%+0.85rem)] z-30 w-56 -translate-x-1/2 rounded-2xl border border-border bg-surface p-3.5 text-left shadow-xl shadow-black/10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* 꼬리 — 테두리와 배경을 겹쳐 그려서 선이 이어져 보이게 합니다. */}
          <span
            aria-hidden
            className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-border bg-surface"
          />

          <p className="flex items-center gap-1.5">
            <BlotIcon className="w-4 text-accent" />
            <span className="font-mono text-xs font-bold tracking-wide">blot</span>
            <span className="font-cute text-[15px] leading-none text-muted">블로그 요약해드림</span>
          </p>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            긴 글을 대신 읽고 세 줄쯤으로 줄여 주는 로봇입니다. 요약은 글 맨 위에 붙어서, 읽기
            전에 무슨 이야기인지 먼저 알 수 있어요.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            글이 바뀌지 않았으면 다시 만들지 않고 저장해 둔 요약을 그대로 씁니다.
          </p>
        </div>
      )}
    </div>
  )
}
