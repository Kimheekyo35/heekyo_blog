import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// public/ 이 아니라 별도 폴더에 둡니다.
// 나중에 서버에 올릴 때 이 폴더만 따로 보관하면 사진이 유지됩니다.
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const MAX_BYTES = 12 * 1024 * 1024 // 12MB
const MAX_WIDTH = 1600 // 블로그 본문 폭을 생각하면 이 이상은 낭비입니다.

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

export type UploadResult = { error: string } | { url: string; width: number; height: number }

export async function saveImage(file: File): Promise<UploadResult> {
  if (!ALLOWED.has(file.type)) {
    return { error: '이미지 파일만 올릴 수 있습니다. (JPG, PNG, WebP, GIF, AVIF)' }
  }
  if (file.size > MAX_BYTES) {
    return { error: '사진은 12MB까지 올릴 수 있습니다.' }
  }

  const input = Buffer.from(await file.arrayBuffer())

  // 움직이는 GIF는 건드리면 정지 이미지가 되므로 그대로 둡니다.
  if (file.type === 'image/gif') {
    const meta = await sharp(input).metadata()
    const name = `${randomUUID()}.gif`
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, name), input)
    return { url: `/api/uploads/${name}`, width: meta.width ?? 0, height: meta.height ?? 0 }
  }

  try {
    const image = sharp(input, { failOn: 'error' })
      // 사진에 담긴 회전 정보를 실제로 적용합니다. 안 하면 세로 사진이 눕습니다.
      .rotate()
    const meta = await image.metadata()

    const output = await image
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true })

    const name = `${randomUUID()}.webp`
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, name), output.data)

    return {
      url: `/api/uploads/${name}`,
      width: output.info.width,
      height: output.info.height ?? meta.height ?? 0,
    }
  } catch {
    return { error: '이미지를 처리하지 못했습니다. 다른 파일로 시도해 주세요.' }
  }
}

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/** 저장된 사진을 읽어옵니다. 파일 이름을 통해 다른 경로로 빠져나가지 못하게 막습니다. */
export async function readImage(filename: string) {
  // UUID + 확장자 형태만 허용합니다. ../ 같은 건 여기서 걸러집니다.
  if (!/^[0-9a-f-]{36}\.(webp|gif)$/.test(filename)) return null

  const ext = path.extname(filename)
  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename))
    return { data, contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream' }
  } catch {
    return null
  }
}
