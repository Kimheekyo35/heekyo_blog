import { createHash } from 'node:crypto'
import { db } from '@/lib/db'

// 모델을 바꾸고 싶으면 .env의 BLOT_MODEL만 고치면 됩니다.
const DEFAULT_MODEL = 'gpt-4o-mini'
// 아주 긴 글이 들어와도 비용이 튀지 않도록 잘라서 보냅니다.
const MAX_INPUT_CHARS = 12_000

/** 본문이 바뀌었는지 판단하는 기준값. 이 값이 같으면 API를 다시 부르지 않습니다. */
export function contentHash(content: string) {
  return createHash('sha256').update(content).digest('hex').slice(0, 32)
}

/** 요약에 넣을 용도로 HTML에서 글자만 뽑아냅니다. */
function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function requestSummary(title: string, text: string, model: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            '당신은 블로그 글을 요약하는 도우미입니다. 한국어로, 2~3문장의 평서문으로만 요약하세요. ' +
            '"이 글은", "필자는" 같은 상투적인 말머리를 쓰지 말고 내용부터 바로 씁니다. ' +
            '글에 없는 내용을 지어내지 마세요. 목록이나 제목 없이 줄글로만 답합니다.',
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n본문:\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }),
    // 응답이 없으면 무한정 기다리지 않도록
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`OpenAI 응답 오류 ${response.status}: ${detail.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const summary = data.choices?.[0]?.message?.content?.trim()
  if (!summary) throw new Error('OpenAI가 빈 응답을 돌려주었습니다.')
  return summary
}

export type EnsureSummaryResult =
  | { status: 'created' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }

/**
 * 필요할 때만 요약을 만들어 저장합니다.
 * 본문이 그대로이고 모델도 같으면 API를 부르지 않고 그냥 지나갑니다.
 */
export async function ensureSummary(postId: string): Promise<EnsureSummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { status: 'skipped', reason: 'OPENAI_API_KEY가 설정되지 않았습니다.' }

  const model = process.env.BLOT_MODEL || DEFAULT_MODEL

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      title: true,
      content: true,
      published: true,
      summary: true,
      summaryHash: true,
      summaryModel: true,
    },
  })
  if (!post) return { status: 'skipped', reason: '글을 찾을 수 없습니다.' }
  if (!post.published) return { status: 'skipped', reason: '발행되지 않은 글입니다.' }

  const hash = contentHash(post.content)
  const upToDate = post.summary && post.summaryHash === hash && post.summaryModel === model
  if (upToDate) return { status: 'skipped', reason: '이미 최신 요약이 있습니다.' }

  const text = htmlToText(post.content)
  // 너무 짧은 글은 요약할 게 없습니다.
  if (text.length < 200) return { status: 'skipped', reason: '요약하기에 너무 짧은 글입니다.' }

  try {
    const summary = await requestSummary(
      post.title,
      text.slice(0, MAX_INPUT_CHARS),
      model,
      apiKey,
    )
    await db.post.update({
      where: { id: postId },
      data: { summary, summaryHash: hash, summaryModel: model, summaryAt: new Date() },
    })
    return { status: 'created' }
  } catch (error) {
    // 요약에 실패해도 글 발행 자체는 문제없이 끝나야 합니다.
    const reason = error instanceof Error ? error.message : String(error)
    console.error('[blot] 요약 생성 실패:', reason)
    return { status: 'failed', reason }
  }
}
