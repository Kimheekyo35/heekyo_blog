'use client'

import { useRef, useState, useTransition } from 'react'
import { addDesktopItem } from '@/lib/actions/desktop'
import { uploadImage } from '@/lib/upload-client'

/**
 * 바탕화면에 사진이나 파일을 올리는 버튼. 블로그 주인에게만 보입니다.
 * 놓을 자리는 서버가 빈 곳으로 골라 줍니다(src/lib/desktop.ts).
 */
export function DesktopAdder() {
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
          <p className="mb-3 text-sm font-semibold">바탕화면에 올리기</p>

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
              {working ? '올리는 중…' : '사진 고르기'}
            </button>
            <button
              type="button"
              disabled={working}
              onClick={onAddNote}
              className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              빈 파일
            </button>
          </div>

          {error && <p className="mt-2.5 text-xs text-red-600">{error}</p>}
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
        {open ? '닫기' : '배경에 올리기'}
      </button>
    </div>
  )
}
