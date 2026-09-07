'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { saveProfile } from '@/lib/actions/profile'
import { uploadImage } from '@/lib/upload-client'
import type { Profile } from '@/lib/profile'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-xs text-muted">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name)
  const [tagline, setTagline] = useState(profile.tagline)
  const [bio, setBio] = useState(profile.bio)
  const [hobbies, setHobbies] = useState(profile.hobbies)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)

  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatar(file: File) {
    setError(null)
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      setAvatarUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : '사진을 올리지 못했습니다.')
    } finally {
      setUploading(false)
    }
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await saveProfile({ name, tagline, bio, hobbies, avatarUrl })
      // 저장에 성공하면 홈으로 보내므로, 값이 돌아왔다면 실패한 것입니다.
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">소개 편집</h1>

      <div className="flex items-center gap-5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="프로필 사진 미리보기"
            width={192}
            height={192}
            className="w-24 h-24 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-border shrink-0" aria-hidden />
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-1.5 rounded-full border border-border text-sm hover:bg-border/40 disabled:opacity-50"
          >
            {uploading ? '올리는 중…' : avatarUrl ? '사진 바꾸기' : '사진 올리기'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="block text-xs text-muted hover:text-red-500"
            >
              사진 지우기
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleAvatar(file)
            e.target.value = ''
          }}
        />
      </div>

      <Field label="이름">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="김희교"
          className={inputClass}
        />
      </Field>

      <Field label="한 줄 소개" hint="이름 아래에 강조색으로 표시됩니다.">
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          maxLength={80}
          placeholder="기록하는 사람"
          className={inputClass}
        />
      </Field>

      <Field label="자기소개" hint={`${bio.length}/600자 · 줄바꿈이 그대로 보입니다.`}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={600}
          rows={5}
          placeholder="어떤 사람인지, 무엇을 쓰는지 자유롭게 적어보세요."
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="취미" hint="쉼표(,)로 구분해서 적으면 하나씩 따로 표시됩니다.">
        <input
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          maxLength={200}
          placeholder="독서, 커피 내리기, 등산"
          className={inputClass}
        />
      </Field>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isPending || uploading}
        className="px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? '저장 중…' : '저장하기'}
      </button>
    </div>
  )
}
