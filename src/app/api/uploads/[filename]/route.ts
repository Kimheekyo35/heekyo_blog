import { readImage } from '@/lib/uploads'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const image = await readImage(filename)
  if (!image) return new Response('Not found', { status: 404 })

  return new Response(new Uint8Array(image.data), {
    headers: {
      'Content-Type': image.contentType,
      // 파일 이름이 매번 새로 생기므로 오래 캐시해도 안전합니다.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
