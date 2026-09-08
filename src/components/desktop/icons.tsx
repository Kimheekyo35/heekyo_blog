/*
  바탕화면에 놓이는 그림들 — 폴더, 문서, 화살표 커서.
  색은 globals.css의 --folder-* 를 따라가므로 다크 모드에서도 알아서 어두워집니다.
  그라데이션 대신 면을 두 장 겹쳐 입체를 냅니다. SVG 그라데이션은 id가 겹치면
  같은 화면에 여러 개 놓을 때 서로 간섭합니다.
*/

/** 파란 폴더. 뒷장(탭)과 앞장을 겹쳐 그립니다. */
export function FolderIcon({ className = 'w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      {/* 뒷장 — 왼쪽 위에 서류철 탭이 튀어나옵니다. */}
      <path
        d="M4 17q0-9 9-9h25q4 0 6.5 3l4.5 6h38q9 0 9 9v45q0 9-9 9H13q-9 0-9-9z"
        fill="var(--folder-back)"
      />
      {/* 앞장 — 뒷장보다 살짝 넓고 아래로 내려와 있어야 서류철처럼 보입니다. */}
      <path
        d="M1.5 31q0-9 9-9h79q9 0 9 9v32q0 9-9 9h-79q-9 0-9-9z"
        fill="var(--folder)"
      />
      {/* 앞장 윗변의 빛 — 두 장의 경계를 또렷하게 합니다. */}
      <path
        d="M1.5 31q0-9 9-9h79q9 0 9 9v2q0-9-9-9h-79q-9 0-9 9z"
        fill="#fff"
        opacity="0.35"
      />
    </svg>
  )
}

/** 사진이 없는 글에 씌우는 문서 아이콘. 오른쪽 위가 접혀 있습니다. */
export function DocIcon({ className = 'w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden>
      <path
        d="M6 8q0-6 6-6h38l24 24v66q0 6-6 6H12q-6 0-6-6z"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      {/* 접힌 모서리 */}
      <path d="M50 2l24 24H56q-6 0-6-6z" fill="var(--border)" opacity="0.7" />
      {/* 글줄 */}
      <g stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" opacity="0.35">
        <path d="M18 46h44M18 58h44M18 70h28" />
      </g>
    </svg>
  )
}

/** 글쓰기 타일에 들어가는 연필. */
export function PencilIcon({ className = 'w-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="M14.5 5.5l4 4" />
    </svg>
  )
}
