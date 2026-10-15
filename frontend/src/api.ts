// バックエンドの API を呼ぶ関数をまとめたファイル
// /api で始まる URL は、Vite のプロキシがバックエンド（8080 番）へ取り次ぐ
import type { Card, TaskList } from './types'

// 失敗したときのメッセージを作る。バックエンドは {"message":"…"} の形で理由を返す
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // 本文が JSON でないときは、決まった文を使う
  }
  return `${fallback}（${res.status}）`
}

// ボード全体（リストとその中のカード）を読む
export async function fetchBoard(): Promise<TaskList[]> {
  const res = await fetch('/api/lists')
  if (!res.ok) {
    throw new Error(`ボードの読み込みに失敗しました（${res.status}）`)
  }
  return res.json()
}

// カードを追加する（POST /api/cards）。リストのいちばん下に入る
export async function createCard(listId: number, content: string): Promise<Card> {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, content }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'カードの追加に失敗しました'))
  }
  return res.json()
}
