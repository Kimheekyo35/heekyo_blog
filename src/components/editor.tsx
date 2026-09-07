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
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { ImageGrid, GRID_LAYOUTS, DEFAULT_GRID_LAYOUT } from '@/lib/tiptap/image-grid'
import { Figure } from '@/lib/tiptap/figure'

// 글자색 팔레트. 본문에 쓸 만큼만 추립니다.
const TEXT_COLORS = [
  { value: '', label: '기본색', swatch: 'currentColor' },
  { value: '#c2410c', label: '주황', swatch: '#c2410c' },
  { value: '#dc2626', label: '빨강', swatch: '#dc2626' },
  { value: '#ca8a04', label: '노랑', swatch: '#ca8a04' },
  { value: '#15803d', label: '초록', swatch: '#15803d' },
  { value: '#1d4ed8', label: '파랑', swatch: '#1d4ed8' },
  { value: '#7c3aed', label: '보라', swatch: '#7c3aed' },
  { value: '#78716c', label: '회색', swatch: '#78716c' },
]

/**
 * 커서가 사진 묶음 안(또는 묶음 자체를 선택한 상태)이면 그 묶음의 끝 위치를 돌려줍니다.
 * 새 사진을 그 자리에 이어 붙이기 위한 것입니다.
 */
function selectedGridEnd(editor: TiptapEditor): number | null {
  if (!editor.isActive('imageGrid')) return null

  const { selection, doc } = editor.state
  let end: number | null = null
  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === 'imageGrid') {
      end = pos + node.nodeSize - 1 // 닫는 태그 바로 앞
    }
  })
  return end
}

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
      // 사진 묶음을 선택했을 때만 배치 조절을 보여줍니다.
      gridSelected: e.isActive('imageGrid'),
      gridLayout: (e.getAttributes('imageGrid').layout as string | undefined) ?? DEFAULT_GRID_LAYOUT,
      // 사진 한 장을 선택하면 대체 텍스트를 고칠 수 있습니다.
      imageSelected: e.isActive('image'),
      imageSrc: (e.getAttributes('image').src as string | undefined) ?? '',
      imageAlt: (e.getAttributes('image').alt as string | undefined) ?? '',
      textColor: (e.getAttributes('textStyle').color as string | undefined) ?? '',
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
        title="사진 넣기 — 파일 창에서 Ctrl+클릭으로 여러 장을 고르면 묶어서 배치됩니다"
        disabled={uploading}
        onClick={onPickImage}
      >
        {uploading ? '…' : '🖼'}
      </ToolbarButton>

      {state.gridSelected && (
        <label className="flex items-center gap-1.5 text-xs text-muted pl-1">
          배치
          <select
            value={state.gridLayout}
            onChange={(e) =>
              editor.chain().focus().updateAttributes('imageGrid', { layout: e.target.value }).run()
            }
            className="rounded border border-border bg-surface px-1.5 py-1 text-xs"
          >
            {GRID_LAYOUTS.map((layout) => (
              <option key={layout.value} value={layout.value} title={layout.hint}>
                {layout.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {state.imageSelected && (
        <label className="flex items-center gap-1.5 text-xs text-muted pl-1">
          설명
          {/*
            선택한 사진이 바뀌면 입력칸을 새로 만들어야 값이 따라옵니다.
            타이핑 중에 문서를 계속 고치면 커서가 튀므로 다 쓰고 나갈 때 반영합니다.
          */}
          <input
            key={state.imageSrc}
            defaultValue={state.imageAlt}
            onBlur={(e) =>
              editor.chain().updateAttributes('image', { alt: e.target.value.trim() }).run()
            }
            placeholder="사진 설명 (alt)"
            className="w-40 rounded border border-border bg-surface px-2 py-1 text-xs"
          />
        </label>
      )}

      <span className="w-px h-5 bg-border mx-1" />

      <div className="flex items-center gap-1" role="group" aria-label="글자색">
        {TEXT_COLORS.map((color) => {
          const selected = state.textColor === color.value
          return (
            <button
              key={color.label}
              type="button"
              title={color.label}
              aria-label={color.label}
              aria-pressed={selected}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                color.value
                  ? chain().setColor(color.value).run()
                  : chain().unsetColor().run()
              }
              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                selected ? 'border-foreground scale-110' : 'border-border'
              }`}
              style={{
                // 기본색 칸은 색을 칠하지 않고 비워 둡니다.
                backgroundColor: color.value || 'transparent',
              }}
            >
              {!color.value && <span className="text-[10px] leading-none">×</span>}
            </button>
          )
        })}
      </div>

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
        // 파일명(IMG_1234.jpg)은 사진 설명으로 쓸모가 없으므로 비워 둡니다.
        // 툴바에서 사진을 선택해 직접 쓸 수 있습니다.
        uploaded.push({ src: url, alt: '' })
      }

      if (uploaded.length === 0) return

      const images = uploaded.map((image) => ({ type: 'image', attrs: image }))

      // 이미 만들어 둔 사진 묶음을 선택한 상태라면 새로 만들지 않고 거기에 이어 붙입니다.
      const gridEnd = selectedGridEnd(editor)
      if (gridEnd !== null) {
        editor.chain().focus().insertContentAt(gridEnd, images).run()
        return
      }

      if (uploaded.length === 1) {
        // 한 장일 때는 설명(캡션)을 쓸 수 있는 형태로 넣습니다.
        editor
          .chain()
          .focus()
          .insertContent({ type: 'figure', attrs: uploaded[0], content: [] })
          .run()
        return
      }

      // 두 장 이상이면 격자로 묶습니다.
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'imageGrid',
          attrs: { layout: DEFAULT_GRID_LAYOUT },
          content: images,
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
      Figure,
      TextStyle,
      Color,
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
          : '사진 여러 장은 파일 창에서 Ctrl(맥은 ⌘)을 누른 채 클릭하세요. 한 장만 넣으면 사진 아래에 설명을 쓸 수 있습니다.'}
      </p>

      {uploadError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  )
}
