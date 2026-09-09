'use client'

import { useState, useTransition } from 'react'
import { setFolderColor } from '@/lib/actions/folder'
import { FOLDER_COLORS, type FolderColorName } from '@/lib/folder-colors'

/**
 * 폴더 아이콘에 붙는 작은 색 단추. 주인이 가리켰을 때만 보입니다.
 * 여기서 고른 색은 그 폴더 하나에만 적용됩니다.
 */
export function FolderColorPicker({ slug, color }: { slug: string; color: FolderColorName }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div className="absolute -left-2 -top-2 z-20">
      <button
        type="button"
        title="폴더 색 바꾸기"
        aria-label="폴더 색 바꾸기"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        style={{ background: FOLDER_COLORS[color].light.folder }}
        className="block h-5 w-5 rounded-full ring-1 ring-black/20 transition-transform hover:scale-110 disabled:opacity-50"
      />

      {open && (
        <div className="absolute left-0 top-6 flex w-max gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/10">
          {(Object.keys(FOLDER_COLORS) as FolderColorName[]).map((name) => (
            <button
              key={name}
              type="button"
              title={FOLDER_COLORS[name].label}
              aria-label={FOLDER_COLORS[name].label}
              disabled={pending}
              onClick={() => {
                setOpen(false)
                startTransition(async () => void (await setFolderColor(slug, name)))
              }}
              style={{ background: FOLDER_COLORS[name].light.folder }}
              className={`h-5 w-5 rounded-md transition-transform hover:scale-110 disabled:opacity-50 ${
                name === color ? 'ring-2 ring-foreground' : 'ring-1 ring-black/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
