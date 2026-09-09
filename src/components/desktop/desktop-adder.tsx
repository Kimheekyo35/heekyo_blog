'use client'

import { useRef, useState, useTransition } from 'react'
import { addDesktopItem, resetDesktopSpots, showAllDesktopIcons } from '@/lib/actions/desktop'
import { addFolder } from '@/lib/actions/folder'
import { DEFAULT_FOLDER_COLOR, FOLDER_COLORS, type FolderColorName } from '@/lib/folder-colors'
import { uploadImage } from '@/lib/upload-client'

/**
 * 바탕화면에 폴더나 사진을 올리는 버튼. 블로그 주인에게만 보입니다.
 * 새로 만든 것은 빈자리에 놓이고, 그다음부터는 끌어서 원하는 곳에 두면 됩니다.
 */
export function DesktopAdder() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [color, setColor] = useState<FolderColorName>(DEFAULT_FOLDER_COLOR)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)

  const working = busy || pending

  function done(result: { error: string } | { ok: true }) {
    if ('error' in result) {
      setError(result.error)
      return
    }
    setError('')
    setName('')
    setTagline('')
    setOpen(false)
  }

  /** 글을 담는 폴더를 새로 만듭니다. 개발기록·일상 같은 그 폴더입니다. */
  function onAddFolder() {
    if (!name.trim()) {
      setError('폴더 이름을 적어 주세요.')
      return
    }
    startTransition(async () => {
      done(await addFolder({ label: name, color, tagline }))
    })
  }

  /** 바탕화면에 붙여 두는 사진. 글과는 상관없는 장식입니다. */
  async function onPickImage(file: File) {
    setError('')
    setBusy(true)
    try {
      const image = await uploadImage(file)
      const result = await addDesktopItem({
        kind: 'image',
        imageUrl: image.url,
        // 이름을 안 적었으면 올린 파일 이름을 그대로 씁니다.
        label: name.trim() || file.name.replace(/\.[^.]+$/, ''),
      })
      done(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '사진을 올리지 못했습니다.')
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 lg:absolute lg:bottom-6 lg:right-8">
      {open && (
        <div className="mb-3 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/10">
          <p className="mb-1 text-sm font-semibold">폴더 만들기</p>
          <p className="mb-3 text-xs leading-relaxed text-muted">
            폴더는 글을 담는 분류입니다. 만들면 바탕화면에 놓이고, 글쓰기 화면의 분류에도 바로
            나옵니다. 이름은 나중에 아이콘의 ✎ 로 고칠 수 있어요.
          </p>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onPickImage(file)
            }}
          />

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="폴더 이름 (예: 여행)"
            maxLength={20}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />

          {/* 폴더 화면 맨 위에 나오는 한 줄. 안 적어도 됩니다. */}
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="한 줄 설명 (선택)"
            maxLength={80}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />

          {/* 새로 만들 폴더의 색. 이미 있는 폴더는 아이콘 옆 동그라미로 바꿉니다. */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(Object.keys(FOLDER_COLORS) as FolderColorName[]).map((name) => (
              <button
                key={name}
                type="button"
                disabled={working}
                title={FOLDER_COLORS[name].label}
                aria-label={`폴더 색 ${FOLDER_COLORS[name].label}`}
                aria-pressed={color === name}
                onClick={() => setColor(name)}
                style={{ background: FOLDER_COLORS[name].light.folder }}
                className={`h-6 w-6 rounded-md ring-offset-2 ring-offset-surface transition-shadow disabled:opacity-50 ${
                  color === name ? 'ring-2 ring-foreground' : 'ring-1 ring-black/10'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={working}
            onClick={onAddFolder}
            className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            폴더 만들기
          </button>

          <button
            type="button"
            disabled={working}
            onClick={() => fileInput.current?.click()}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {working ? '올리는 중…' : '사진 붙이기'}
          </button>

          {error && <p className="mt-2.5 text-xs text-red-600">{error}</p>}

          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted">
            <button
              type="button"
              disabled={working}
              onClick={() => startTransition(async () => void (await showAllDesktopIcons()))}
              className="text-left transition-colors hover:text-foreground disabled:opacity-50"
            >
              치운 아이콘 다시 꺼내기
            </button>
            <button
              type="button"
              disabled={working}
              onClick={() => startTransition(async () => void (await resetDesktopSpots()))}
              className="text-left transition-colors hover:text-foreground disabled:opacity-50"
            >
              아이콘 자리 처음으로 되돌리기
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setError('')
        }}
        className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm shadow-lg shadow-black/10 transition-colors hover:border-accent hover:text-accent"
      >
        <span aria-hidden className="text-base leading-none">
          {open ? '×' : '+'}
        </span>
        {open ? '닫기' : '폴더·사진 만들기'}
      </button>
    </div>
  )
}
