'use client'

import { useState, useTransition } from 'react'

/**
 * 아이콘 이름표를 고치는 작은 연필 단추. 주인이 가리켰을 때만 보입니다.
 * 누르면 그 자리에서 이름을 고쳐 쓸 수 있습니다.
 */
export function RenameButton({
  label,
  rename,
}: {
  label: string
  /** 서버에서 이름을 바꾸는 일. 아이콘마다 자기 것을 넘겨받습니다. */
  rename: (label: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(label)
  const [pending, startTransition] = useTransition()

  function save() {
    const next = value.trim()
    if (!next || next === label) {
      setOpen(false)
      return
    }
    startTransition(async () => {
      await rename(next)
      setOpen(false)
    })
  }

  return (
    // 아이콘을 끄는 손짓과 섞이지 않게, 여기서 일어난 일은 위로 올려보내지 않습니다.
    <div className="absolute -bottom-2 -right-2 z-20" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="이름 고치기"
        aria-label="이름 고치기"
        disabled={pending}
        onClick={() => {
          setValue(label)
          setOpen((v) => !v)
        }}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[11px] leading-none shadow ring-1 ring-black/15 disabled:opacity-50"
      >
        ✎
      </button>

      {open && (
        <div className="absolute right-0 top-6 flex w-max items-center gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/10">
          <input
            autoFocus
            value={value}
            maxLength={30}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') setOpen(false)
            }}
            className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-lg bg-accent px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            저장
          </button>
        </div>
      )}
    </div>
  )
}
