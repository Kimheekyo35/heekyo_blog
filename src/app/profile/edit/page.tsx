import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfile } from '@/lib/profile'
import { ProfileForm } from '@/components/profile-form'

export const metadata = { title: '소개 편집' }

export default async function ProfileEditPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const profile = await getProfile()
  return <ProfileForm profile={profile} />
}
