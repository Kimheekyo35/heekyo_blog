'use client'

import { useState } from 'react'

/**
 * 아이콘을 치우는 × 단추.
 * 실수로 눌러 사라지는 일이 없도록, 한 번 더 물어본 뒤에 치웁니다.
 */
export function RemoveButton({
  remove,
  hint,
}: {
  /** 서버에서 실제로 치우는 일. 아이콘마다 자기 것을 넘겨받습니다. */
  remove: () => Promise<void>
  /** 무엇이 어떻게 되는지 알려 주는 한 줄. */
  hint: string
}) {
  const [asking, setAsking] = useState(false)

  return (
    // 아이콘을 끄는 손짓과 섞이지 않게, 여기서 일어난 일은 위로 올려보내지 않습니다.
    <div className="absolute -right-2 -top-2 z-20" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="바탕화면에서 치우기"
        aria-label="바탕화면에서 치우기"
        onClick={() => setAsking((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs leading-none text-background shadow"
      >
        ×
      </button>

      {asking && (
        <div className="absolute right-0 top-6 w-max max-w-[13rem] rounded-xl border border-border bg-surface p-2.5 text-left shadow-lg shadow-black/10">
          <p className="mb-2 whitespace-normal text-xs leading-relaxed">{hint}</p>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="rounded-lg border border-border px-2 py-1 text-xs transition-colors hover:text-foreground"
            >
              취소
            </button>
            <form action={remove}>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                치우기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
