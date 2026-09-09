'use client'

import { createContext, useContext, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { moveDesktopIcon } from '@/lib/actions/desktop'

/*
  바탕화면과, 그 위에 놓인 아이콘 하나.

  주인이 보고 있을 때는 아이콘을 끌어서 아무 데나 놓을 수 있고, 손을 떼면 그 자리가
  저장됩니다. 자리는 바탕화면 크기에 대한 비율(%)로 적으므로 창 크기가 달라져도
  같은 곳에 있습니다. 좁은 화면은 아이콘이 위에서 아래로 흐르는 배치라 끌지 않습니다.
*/

type Surface = { ref: RefObject<HTMLElement | null>; editable: boolean }

const SurfaceContext = createContext<Surface | null>(null)

/** 아이콘을 끌 수 있는 넓은 화면인지. */
function isSpreadOut() {
  return window.matchMedia('(min-width: 1024px)').matches
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function DesktopSurface({
  editable,
  className,
  children,
}: {
  editable: boolean
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const value = useMemo(() => ({ ref, editable }), [editable])

  return (
    <SurfaceContext.Provider value={value}>
      <section ref={ref} className={className}>
        {children}
      </section>
    </SurfaceContext.Provider>
  )
}

export function DesktopItem({
  spotKey,
  x,
  y,
  rotate = 0,
  width = '7.5rem',
  children,
}: {
  /** 자리를 기억할 때 쓰는 이름. 예: "folder:daily", "item:abc123" */
  spotKey: string
  x: number
  y: number
  /** 살짝 비뚤어진 각도. 반듯하게만 놓으면 늘어놓은 느낌이 안 납니다. */
  rotate?: number
  /** 아이콘 폭. 좁은 화면에서도 이 폭을 씁니다. */
  width?: string
  children: React.ReactNode
}) {
  const surface = useContext(SurfaceContext)
  const editable = surface?.editable ?? false

  const [pos, setPos] = useState({ x, y })
  const [dragging, setDragging] = useState(false)

  // 끄는 동안의 좌표는 여기에도 같이 적어 둡니다. 손을 떼는 순간 화면이 아직
  // 다시 그려지지 않았을 수 있어서, 저장할 때는 state 대신 이 값을 씁니다.
  const drag = useRef<{
    px: number
    py: number
    baseX: number
    baseY: number
    x: number
    y: number
    moved: boolean
  } | null>(null)
  // 끌고 나서 손을 뗄 때 링크가 열리는 것을 한 번 막아 줍니다.
  const swallowClick = useRef(false)

  // 서버에 저장된 자리가 바뀌면(다른 창에서 옮겼다면) 따라갑니다.
  // 그리는 중에 맞추는 편이 화면을 두 번 그리지 않아 깔끔합니다.
  const [saved, setSaved] = useState({ x, y })
  if (saved.x !== x || saved.y !== y) {
    setSaved({ x, y })
    setPos({ x, y })
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!editable || e.button !== 0 || !isSpreadOut()) return
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      baseX: pos.x,
      baseY: pos.y,
      x: pos.x,
      y: pos.y,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current
    const box = surface?.ref.current
    if (!state || !box) return

    const dx = e.clientX - state.px
    const dy = e.clientY - state.py
    // 몇 픽셀 흔들린 것은 끈 것이 아니라 그냥 누른 것으로 봅니다.
    if (!state.moved && Math.abs(dx) + Math.abs(dy) < 4) return
    state.moved = true

    const rect = box.getBoundingClientRect()
    state.x = clamp(state.baseX + (dx / rect.width) * 100, 2, 98)
    state.y = clamp(state.baseY + (dy / rect.height) * 100, 3, 97)
    setPos({ x: state.x, y: state.y })
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current
    drag.current = null
    setDragging(false)
    if (!state) return

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (!state.moved) return

    swallowClick.current = true
    void moveDesktopIcon(spotKey, state.x, state.y)
  }

  return (
    <div
      className={`desktop-item ${editable ? 'desktop-item-editable' : ''} ${
        dragging ? 'desktop-item-dragging' : ''
      }`}
      style={
        {
          '--x': `${pos.x}%`,
          '--y': `${pos.y}%`,
          '--r': `${rotate}deg`,
          '--w': width,
        } as CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (!swallowClick.current) return
        e.preventDefault()
        e.stopPropagation()
        swallowClick.current = false
      }}
      // 사진·링크를 끌면 브라우저가 제 나름대로 끌어가려 해서 막습니다.
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}
