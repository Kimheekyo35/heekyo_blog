import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/generated/prisma/client'

// 개발 중에는 파일이 저장될 때마다 모듈이 다시 실행되므로,
// 전역에 하나만 두지 않으면 DB 연결이 계속 쌓입니다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요.')
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
