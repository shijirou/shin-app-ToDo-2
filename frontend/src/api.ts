// バックエンドの API を呼ぶ関数をまとめたファイル
// /api で始まる URL は、Vite のプロキシがバックエンド（8080 番）へ取り次ぐ
import type { TaskList } from './types'

// ボード全体（リストとその中のカード）を読む
export async function fetchBoard(): Promise<TaskList[]> {
  const res = await fetch('/api/lists')
  if (!res.ok) {
    throw new Error(`ボードの読み込みに失敗しました（${res.status}）`)
  }
  return res.json()
}
