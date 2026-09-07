'use client'

import { useRef, useState } from 'react'
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor as TiptapEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import Image from '@tiptap/extension-image'
import { uploadImage, isImageFile } from '@/lib/upload-client'
import {
  ImageGrid,
  GRID_COLUMN_OPTIONS,
  DEFAULT_GRID_COLUMNS,
} from '@/lib/tiptap/image-grid'

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // 버튼을 눌러도 본문 커서를 잃지 않도록
      onClick={onClick}
      disabled={disabled}
      className={`min-w-8 h-8 px-2 rounded text-sm transition-colors disabled:opacity-30 ${
        active ? 'bg-foreground text-background' : 'hover:bg-border/60'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({
  editor,
  onPickImage,
  uploading,
}: {
  editor: TiptapEditor
  onPickImage: () => void
  uploading: boolean
}) {
  // v3에서는 편집기가 매 입력마다 다시 그려지지 않으므로, 눌림 상태는 따로 구독합니다.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      // 사진 격자를 선택했을 때만 칸 수 조절을 보여줍니다.
      gridSelected: e.isActive('imageGrid'),
      gridColumns:
        (e.getAttributes('imageGrid').columns as number | undefined) ?? DEFAULT_GRID_COLUMNS,
    }),
  })

  const chain = () => editor.chain().focus()

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2 bg-surface">
      <ToolbarButton
        title="제목"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <span className="font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton
        title="작은 제목"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <span className="font-bold">H3</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton title="굵게 (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        title="기울임 (Ctrl+I)"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton title="취소선" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="글머리 기호"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        •
      </ToolbarButton>
      <ToolbarButton
        title="번호 매기기"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        title="인용"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        ❝
      </ToolbarButton>
      <ToolbarButton
        title="코드 블록"
        active={state.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      >
        &lt;/&gt;
      </ToolbarButton>
      <ToolbarButton title="구분선" onClick={() => chain().setHorizontalRule().run()}>
        —
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="사진 넣기 (여러 장을 고르면 격자로 배치됩니다)"
        disabled={uploading}
        onClick={onPickImage}
      >
        {uploading ? '…' : '🖼'}
      </ToolbarButton>

      {state.gridSelected && (
        <label className="flex items-center gap-1.5 text-xs text-muted pl-1">
          한 줄에
          <select
            value={state.gridColumns}
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .updateAttributes('imageGrid', { columns: Number(e.target.value) })
                .run()
            }
            className="rounded border border-border bg-surface px-1.5 py-1 text-xs"
          >
            {GRID_COLUMN_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}장
              </option>
            ))}
          </select>
        </label>
      )}

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton title="실행 취소" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton title="다시 실행" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  )
}

export function Editor({
  initialContent,
  onReady,
}: {
  initialContent?: string
  onReady: (editor: TiptapEditor) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 붙여넣기 처리기가 만들어질 때의 editor는 아직 null이라 ref로 우회합니다.
  const editorRef = useRef<TiptapEditor | null>(null)

  async function handleFiles(files: File[]) {
    const editor = editorRef.current
    if (!editor) return

    setUploadError(null)
    setUploading(true)
    try {
      // 먼저 전부 올린 뒤에 한 번에 넣습니다.
      // 한 장씩 넣으면 여러 장일 때 격자로 묶을 수가 없습니다.
      const uploaded: { src: string; alt: string }[] = []
      for (const file of files) {
        const { url } = await uploadImage(file)
        uploaded.push({ src: url, alt: file.name })
      }

      if (uploaded.length === 0) return

      if (uploaded.length === 1) {
        editor.chain().focus().setImage(uploaded[0]).run()
        return
      }

      // 두 장 이상이면 격자로 묶습니다.
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'imageGrid',
          attrs: { columns: DEFAULT_GRID_COLUMNS },
          content: uploaded.map((image) => ({ type: 'image', attrs: image })),
        })
        .run()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '사진을 올리지 못했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '무슨 이야기를 써볼까요?' }),
      Image.configure({ inline: false }),
      ImageGrid,
    ],
    content: initialContent ?? '',
    // 서버에서 미리 그려두면 화면이 어긋나므로 브라우저에서만 그립니다.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none px-4 py-5 min-h-[420px] focus:outline-none',
      },
      // 사진을 복사해서 붙여넣기
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile)
        if (files.length === 0) return false
        event.preventDefault()
        void handleFiles(files)
        return true
      },
      // 사진을 끌어다 놓기
      handleDrop: (_view, event) => {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []).filter(isImageFile)
        if (files.length === 0) return false
        event.preventDefault()
        void handleFiles(files)
        return true
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
      onReady(editor)
    },
  })

  if (!editor) {
    return <div className="min-h-[480px] animate-pulse bg-border/30 rounded-xl" />
  }

  return (
    <div>
      <div className="border border-border rounded-xl overflow-hidden bg-surface">
        {/* 툴바는 스크롤 영역 밖에 둬서 글이 길어져도 계속 보이게 합니다. */}
        <Toolbar
          editor={editor}
          uploading={uploading}
          onPickImage={() => fileInputRef.current?.click()}
        />
        {/*
          본문만 따로 스크롤합니다. 이렇게 하지 않으면 글이 길어질수록
          칸이 계속 늘어나서 발행 버튼이 저 아래로 밀려납니다.
        */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          <EditorContent editor={editor} />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) void handleFiles(files)
          e.target.value = '' // 같은 파일을 다시 골라도 동작하도록
        }}
      />

      <p className="mt-2 text-xs text-muted">
        {uploading
          ? '사진 올리는 중…'
          : '사진은 버튼으로 고르거나, 본문에 바로 붙여넣거나 끌어다 놓을 수 있습니다.'}
      </p>

      {uploadError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  )
}
