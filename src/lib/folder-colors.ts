/*
  폴더 색. 고를 수 있는 색을 여기에만 적어 두고, 고른 이름을 DB에 저장합니다.
  (색 값 자체를 저장하지 않는 것은, 나중에 색감을 다듬으면 이미 고른 사람도
  같이 예뻐지게 하려는 것입니다.)

  어두운 화면에서는 같은 색이 너무 튀어서, 색마다 어두운 짝을 따로 둡니다.
  값은 globals.css의 --folder(앞장) / --folder-back(뒷장) / --folder-edge에 들어갑니다.
*/

export type FolderColorName = 'blue' | 'green' | 'butter' | 'peach' | 'lilac' | 'ash'

type Shade = { folder: string; back: string; edge: string }

export const FOLDER_COLORS: Record<FolderColorName, { label: string; light: Shade; dark: Shade }> = {
  blue: {
    label: '파랑',
    light: { folder: '#7fadd8', back: '#9cc3e6', edge: '#6a9ac9' },
    dark: { folder: '#5c88b5', back: '#6f9cc7', edge: '#48719c' },
  },
  green: {
    label: '초록',
    light: { folder: '#8bc0a0', back: '#a7d4b8', edge: '#71a98a' },
    dark: { folder: '#5d9179', back: '#6fa78c', edge: '#4a7a63' },
  },
  butter: {
    label: '노랑',
    light: { folder: '#e7c56b', back: '#f0d78e', edge: '#cfa94c' },
    dark: { folder: '#b3944a', back: '#c4a75e', edge: '#977a37' },
  },
  peach: {
    label: '살구',
    light: { folder: '#eda98c', back: '#f5c1a9', edge: '#d68a6c' },
    dark: { folder: '#b87c62', back: '#c99175', edge: '#9a6349' },
  },
  lilac: {
    label: '연보라',
    light: { folder: '#b3a3dd', back: '#c8bbe8', edge: '#9686c6' },
    dark: { folder: '#8577ad', back: '#9789bf', edge: '#6c5f92' },
  },
  ash: {
    label: '회색',
    light: { folder: '#adaba4', back: '#c4c2bb', edge: '#93918a' },
    dark: { folder: '#7c7a74', back: '#8e8c85', edge: '#65635e' },
  },
}

export const DEFAULT_FOLDER_COLOR: FolderColorName = 'blue'

export function isFolderColor(value: unknown): value is FolderColorName {
  return typeof value === 'string' && value in FOLDER_COLORS
}

/**
 * 고른 색을 CSS로 바꿔 줍니다. 화면 맨 바깥(<html>)에 넣어서 헤더의 작은 폴더까지
 * 같은 색이 되게 합니다. globals.css의 기본값보다 나중에 나와야 이깁니다.
 */
export function folderColorCss(name: FolderColorName) {
  const { light, dark } = FOLDER_COLORS[name]
  const vars = (shade: Shade) =>
    `--folder:${shade.folder};--folder-back:${shade.back};--folder-edge:${shade.edge};`

  return `:root{${vars(light)}}@media (prefers-color-scheme:dark){:root{${vars(dark)}}}`
}
