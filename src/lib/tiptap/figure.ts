import { Node, mergeAttributes } from '@tiptap/core'

/**
 * 설명(캡션)을 붙일 수 있는 사진.
 *
 * `<figure><img><figcaption>설명</figcaption></figure>` 형태로 저장됩니다.
 * 노드의 내용물이 곧 캡션이라, 편집기에서 사진 아래를 눌러 바로 쓸 수 있습니다.
 */
export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*', // 이 자리에 들어가는 글이 캡션입니다
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        // 편집 가능한 부분은 figcaption뿐입니다. 사진은 속성으로 다룹니다.
        contentElement: 'figcaption',
        getAttrs: (element) => {
          const image = element.querySelector('img')
          if (!image) return false // 사진 없는 figure는 이 노드가 아닙니다
          return {
            src: image.getAttribute('src'),
            alt: image.getAttribute('alt'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, ...rest } = HTMLAttributes
    return [
      'figure',
      mergeAttributes(rest),
      ['img', { src, alt: alt ?? '' }],
      ['figcaption', {}, 0],
    ]
  },
})
