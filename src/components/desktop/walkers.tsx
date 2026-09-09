'use client'

import type { Profile } from '@/lib/profile'
import { BlotBubble } from '@/components/desktop/blot-bubble'
import { ProfileFigure } from '@/components/desktop/profile-window'

/*
  바탕화면 아래를 나란히 걸어 다니는 둘 — 졸라맨과 blot 로봇.

  움직임은 globals.css에 있습니다.
  - .stroll       : 좌우로 오가는 걸음 (자리 이동만)
  - .stroll-face  : 끝에서 몸을 돌리는 것. 그림(SVG)에만 걸어야 합니다. 말풍선이나
                    이모지까지 감싸면 글자가 거울처럼 뒤집힙니다.
  가리키거나 말풍선을 열어 두면 멈춰서 누르기 쉽습니다.
*/
export function Walkers({
  profile,
  hobbies,
  isAdmin,
}: {
  profile: Profile
  hobbies: string[]
  isAdmin: boolean
}) {
  return (
    <div className="stroll absolute bottom-3 left-4 z-10 lg:bottom-9 lg:left-8">
      <div className="flex items-end gap-1.5">
        <BlotBubble />
        <ProfileFigure profile={profile} hobbies={hobbies} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
