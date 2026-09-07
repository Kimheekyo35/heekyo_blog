export type UploadedImage = { url: string; width: number; height: number }

/** 사진 한 장을 서버에 올리고 주소를 돌려받습니다. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? '사진을 올리지 못했습니다.')
  }
  return data as UploadedImage
}

export function isImageFile(file: File) {
  return file.type.startsWith('image/')
}
