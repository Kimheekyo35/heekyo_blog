/**
 * 바탕화면 아이콘들이 함께 쓰는 겉모습.
 * 폴더·파일·타일이 같은 그림자와 같은 이름표를 쓰도록 한곳에 모아 둡니다.
 */

/** 가리키면 살짝 떠오르는 아이콘. */
export const lift =
  'group block text-center transition-transform duration-200 hover:-translate-y-1'

export const shadow = 'drop-shadow-[0_8px_14px_rgba(58,42,34,0.16)]'

/** 사진 미리보기 (글에 넣은 사진, 올려 둔 사진) */
export const photo = `relative mx-auto overflow-hidden rounded-[3px] ring-1 ring-black/10 ${shadow}`

/** 앱 아이콘처럼 생긴 사각 타일 */
export const tile = `flex aspect-square w-full items-center justify-center overflow-hidden rounded-[26%] bg-surface ring-1 ring-black/10 ${shadow}`

/** 아이콘 아래 이름표. 파인더처럼, 가리키면 색이 찹니다. */
export const label =
  'mt-2 inline-block max-w-full rounded px-1.5 py-0.5 align-top leading-tight transition-colors group-hover:bg-accent group-hover:text-white'

/** 파일 이름표 — 글자를 고정폭으로 써서 파일처럼 보이게 합니다. */
export const labelFile = `${label} line-clamp-2 font-mono text-[11px] tracking-tight`
