import { Node, mergeAttributes } from '@tiptap/core'

export const GRID_COLUMN_OPTIONS = [2, 3, 4] as const
export const DEFAULT_GRID_COLUMNS = 3

/**
 * 사진 여러 장을 격자로 묶는 블록.
 *
 * 저장될 때는 `<div data-image-grid data-columns="3">…</div>` 형태의 평범한 HTML이라,
 * 글을 읽는 화면에서도 CSS만으로 그대로 그려집니다.
 */
export const ImageGrid = Node.create({
  name: 'imageGrid',
  group: 'block',
  content: 'image+', // 안에는 사진만 들어갑니다
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      columns: {
        default: DEFAULT_GRID_COLUMNS,
        parseHTML: (element) =>
          Number(element.getAttribute('data-columns')) || DEFAULT_GRID_COLUMNS,
        renderHTML: (attributes) => ({ 'data-columns': String(attributes.columns) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-image-grid]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-image-grid': '' }), 0]
  },
})
