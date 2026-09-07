'use client'

import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor as TiptapEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'

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

function Toolbar({ editor }: { editor: TiptapEditor }) {
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
    }),
  })

  const chain = () => editor.chain().focus()

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2 sticky top-0 bg-background z-10">
      <ToolbarButton title="제목" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <span className="font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton title="작은 제목" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <span className="font-bold">H3</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton title="굵게 (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton title="기울임 (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton title="취소선" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton title="글머리 기호" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        •
      </ToolbarButton>
      <ToolbarButton title="번호 매기기" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        1.
      </ToolbarButton>
      <ToolbarButton title="인용" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        ❝
      </ToolbarButton>
      <ToolbarButton title="코드 블록" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
        {'</>'}
      </ToolbarButton>
      <ToolbarButton title="구분선" onClick={() => chain().setHorizontalRule().run()}>
        —
      </ToolbarButton>

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '무슨 이야기를 써볼까요?' }),
    ],
    content: initialContent ?? '',
    // 서버에서 미리 그려두면 화면이 어긋나므로 브라우저에서만 그립니다.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none px-4 py-5 min-h-[420px] focus:outline-none',
      },
    },
    onCreate: ({ editor }) => onReady(editor),
  })

  if (!editor) {
    return <div className="min-h-[480px] animate-pulse bg-border/30 rounded-lg" />
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
