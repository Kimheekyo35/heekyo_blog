import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { saveImage } from '@/lib/uploads'

export async function POST(request: Request) {
  // 사진을 올릴 수 있는 사람은 글을 쓰는 사람뿐입니다.
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  }

  const result = await saveImage(file)
  if ('error' in result) return NextResponse.json(result, { status: 400 })

  return NextResponse.json(result)
}
