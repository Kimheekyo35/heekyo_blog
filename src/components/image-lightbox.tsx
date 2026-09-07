'use client'

import { useEffect, useState } from 'react'

/**
 * 격자 속 사진을 누르면 원본을 크게 보여줍니다.
 *
 * 본문은 저장된 HTML을 그대로 그리는 터라 각 사진에 직접 이벤트를 붙일 수 없습니다.
 * 그래서 문서 전체에서 클릭을 한 번만 받아 처리합니다.
 */
export function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      // 격자 안의 사진만 대상으로 합니다. 격자는 정사각으로 잘려 있어서
      // 원본을 확인할 방법이 필요하지만, 단독 사진은 이미 원본 비율입니다.
      if (!target.closest('article [data-image-grid]')) return
      setSrc(target.currentSrc || target.src)
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSrc(null)
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  if (!src) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      onClick={() => setSrc(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 cursor-zoom-out"
    >
      {/* 원본 비율 그대로 보여주려는 것이라 next/image의 최적화를 쓰지 않습니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain rounded-lg"
      />
      <button
        type="button"
        onClick={() => setSrc(null)}
        aria-label="닫기"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
      >
        ✕
      </button>
    </div>
  )
}
