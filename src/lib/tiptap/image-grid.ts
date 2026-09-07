import { Node, mergeAttributes } from '@tiptap/core'

/** 사진 묶음 배치 방식. */
export const GRID_LAYOUTS = [
  { value: 'row3', label: '가로 3열', hint: '같은 높이로 나란히' },
  { value: 'cols2', label: '세로 2열', hint: '핀터레스트식으로 쌓임' },
  { value: 'grid2x2', label: '2×2 격자', hint: '네모난 격자' },
] as const

export type GridLayout = (typeof GRID_LAYOUTS)[number]['value']

export const DEFAULT_GRID_LAYOUT: GridLayout = 'row3'

const LAYOUT_VALUES = GRID_LAYOUTS.map((l) => l.value) as readonly string[]

/** 레이아웃을 도입하기 전에 저장된 글은 data-columns만 갖고 있습니다. */
function layoutFromLegacyColumns(columns: string | null): GridLayout {
  if (columns === '2') return 'grid2x2'
  return 'row3'
}

/**
 * 사진 여러 장을 묶어서 보여주는 블록.
 *
 * 저장될 때는 `<div data-image-grid data-layout="row3">…</div>` 형태의 평범한 HTML이라,
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
      layout: {
        default: DEFAULT_GRID_LAYOUT,
        parseHTML: (element) => {
          const layout = element.getAttribute('data-layout')
          if (layout && LAYOUT_VALUES.includes(layout)) return layout
          return layoutFromLegacyColumns(element.getAttribute('data-columns'))
        },
        renderHTML: (attributes) => ({ 'data-layout': String(attributes.layout) }),
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
