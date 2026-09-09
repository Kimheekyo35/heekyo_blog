'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { moveDesktopIcon } from '@/lib/actions/desktop'
import { RemoveButton } from '@/components/desktop/remove-button'

/*
  바탕화면과, 그 위에 놓인 아이콘 하나.

  주인이 보고 있을 때는 아이콘을 끌어서 아무 데나 놓을 수 있고, 손을 떼면 그 자리가
  저장됩니다. 자리는 바탕화면 크기에 대한 비율(%)로 적으므로 창 크기가 달라져도
  같은 곳에 있습니다. 좁은 화면은 아이콘이 위에서 아래로 흐르는 배치라 끌지 않습니다.

  손을 뗄 때까지의 추적은 아이콘이 아니라 window에서 합니다. 아이콘 위에는 링크와
  사진이 얹혀 있어서, 브라우저가 "링크를 끌어다 놓기"를 먼저 시작해 버리면 아이콘
  쪽 포인터 이벤트가 도중에 끊기기 때문입니다. 브라우저의 기본 끌기 자체는
  draggable={false}와 globals.css에서 막습니다.
*/

type Surface = { ref: RefObject<HTMLElement | null>; editable: boolean }

const SurfaceContext = createContext<Surface | null>(null)

/** 아이콘을 흩어 놓는(=끌 수 있는) 넓은 화면인지. globals.css의 1024px과 같은 기준입니다. */
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
  remove,
  removeHint = '바탕화면에서 치울까요? 나중에 다시 꺼낼 수 있어요.',
  extra,
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
  /** 이 아이콘을 바탕화면에서 치우는 방법. 주인에게만 × 단추로 보입니다. */
  remove?: () => Promise<void>
  /** 치우기 전에 한 번 더 물어볼 때 보여 줄 한 줄. */
  removeHint?: string
  /** 아이콘 모서리에 같이 붙일 것(폴더 색 단추 등). 주인에게만 보입니다. */
  extra?: React.ReactNode
  children: React.ReactNode
}) {
  const surface = useContext(SurfaceContext)
  const editable = surface?.editable ?? false

  const [pos, setPos] = useState({ x, y })
  const [dragging, setDragging] = useState(false)

  // 끌고 나서 손을 뗄 때 링크가 열리는 것을 한 번 막아 줍니다.
  const swallowClick = useRef(false)
  // 끄는 도중에 이 아이콘이 화면에서 사라지면 창에 걸어 둔 감시도 거둡니다.
  const detach = useRef<(() => void) | null>(null)
  useEffect(() => () => detach.current?.(), [])

  // 서버에 저장된 자리가 바뀌면(다른 창에서 옮겼다면) 따라갑니다.
  // 그리는 중에 맞추는 편이 화면을 두 번 그리지 않아 깔끔합니다.
  const [saved, setSaved] = useState({ x, y })
  if (saved.x !== x || saved.y !== y) {
    setSaved({ x, y })
    setPos({ x, y })
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!editable || e.button !== 0 || !isSpreadOut()) return
    const box = surface?.ref.current
    if (!box) return

    const startX = e.clientX
    const startY = e.clientY
    const base = { x: pos.x, y: pos.y }
    // 끄는 동안의 좌표는 여기에 적어 둡니다. 손을 떼는 순간 화면이 아직 다시
    // 그려지지 않았을 수 있어서, 저장할 때는 state가 아니라 이 값을 씁니다.
    const now = { x: base.x, y: base.y, moved: false }

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      // 몇 픽셀 흔들린 것은 끈 것이 아니라 그냥 누른 것으로 봅니다.
      if (!now.moved && Math.abs(dx) + Math.abs(dy) < 4) return
      now.moved = true

      const rect = box.getBoundingClientRect()
      now.x = clamp(base.x + (dx / rect.width) * 100, 2, 98)
      now.y = clamp(base.y + (dy / rect.height) * 100, 3, 97)
      setPos({ x: now.x, y: now.y })
    }

    const finish = () => {
      detach.current?.()
      setDragging(false)
      if (!now.moved) return
      swallowClick.current = true
      void moveDesktopIcon(spotKey, now.x, now.y)
    }

    detach.current = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      detach.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    setDragging(true)
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
      onClickCapture={(e) => {
        if (!swallowClick.current) return
        e.preventDefault()
        e.stopPropagation()
        swallowClick.current = false
      }}
      // 브라우저가 링크·사진을 제 나름대로 끌고 가려는 것을 막습니다.
      onDragStart={(e) => e.preventDefault()}
    >
      {/* × 단추를 아이콘 모서리에 붙이려면 감싸는 상자가 기준이 되어야 합니다. */}
      <div className="group/icon relative">
        {children}

        {editable && extra && (
          <div className="opacity-0 transition-opacity focus-within:opacity-100 group-hover/icon:opacity-100">
            {extra}
          </div>
        )}

        {editable && remove && (
          <div className="opacity-0 transition-opacity focus-within:opacity-100 group-hover/icon:opacity-100">
            <RemoveButton remove={remove} hint={removeHint} />
          </div>
        )}
      </div>
    </div>
  )
}
