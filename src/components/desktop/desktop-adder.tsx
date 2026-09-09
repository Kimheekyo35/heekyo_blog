'use client'

import { useRef, useState, useTransition } from 'react'
import {
  addDesktopItem,
  resetDesktopSpots,
  showAllDesktopIcons,
  setFolderColor,
} from '@/lib/actions/desktop'
import { FOLDER_COLORS, type FolderColorName } from '@/lib/folder-colors'
import { uploadImage } from '@/lib/upload-client'

/**
 * 바탕화면에 사진이나 파일을 올리는 버튼. 블로그 주인에게만 보입니다.
 * 새로 올린 것은 빈자리에 놓이고, 그다음부터는 끌어서 원하는 곳에 두면 됩니다.
 */
export function DesktopAdder({ folderColor }: { folderColor: FolderColorName }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
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
    setOpen(false)
  }

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

  function onAddNote() {
    if (!name.trim()) {
      setError('파일 이름을 적어 주세요.')
      return
    }
    startTransition(async () => {
      done(await addDesktopItem({ kind: 'note', label: name }))
    })
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 lg:absolute lg:bottom-6 lg:right-8">
      {open && (
        <div className="mb-3 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/10">
          <p className="mb-1 text-sm font-semibold">바탕화면에 올리기</p>
          <p className="mb-3 text-xs leading-relaxed text-muted">
            올린 다음 아이콘을 끌어서 원하는 자리에 놓으세요. 폴더와 글도 같이 옮길 수 있습니다.
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
            placeholder="이름 (선택)"
            maxLength={30}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />

          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => fileInput.current?.click()}
              className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {working ? '올리는 중…' : '사진 추가'}
            </button>
            <button
              type="button"
              disabled={working}
              onClick={onAddNote}
              className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              파일 추가
            </button>
          </div>

          {error && <p className="mt-2.5 text-xs text-red-600">{error}</p>}

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-muted">폴더 색</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FOLDER_COLORS) as FolderColorName[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={working}
                  title={FOLDER_COLORS[color].label}
                  aria-label={`폴더 색 ${FOLDER_COLORS[color].label}`}
                  aria-pressed={folderColor === color}
                  onClick={() => startTransition(async () => void (await setFolderColor(color)))}
                  style={{ background: FOLDER_COLORS[color].light.folder }}
                  className={`h-7 w-7 rounded-lg ring-offset-2 ring-offset-surface transition-shadow disabled:opacity-50 ${
                    folderColor === color ? 'ring-2 ring-foreground' : 'ring-1 ring-black/10'
                  }`}
                />
              ))}
            </div>
          </div>

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
        {open ? '닫기' : '사진·파일 추가'}
      </button>
    </div>
  )
}
