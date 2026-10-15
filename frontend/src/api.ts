// バックエンドの API を呼ぶ関数をまとめたファイル
// /api で始まる URL は、Vite のプロキシがバックエンド（8080 番）へ取り次ぐ
import type { Card, Priority, TaskList } from './types'

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

// リストを追加する（POST /api/lists）。ボードのいちばん右に入る
export async function createList(name: string): Promise<TaskList> {
  const res = await fetch('/api/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'リストの追加に失敗しました'))
  }
  return res.json()
}

// リストの名前を変える（PATCH /api/lists/{id}）
export async function renameList(id: number, name: string): Promise<TaskList> {
  const res = await fetch(`/api/lists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'リスト名の変更に失敗しました'))
  }
  return res.json()
}

// リストを並び替える（PATCH /api/lists/{id}/move）
// position は、左から何番目に置くか（0 から数える）。成功すると本文なし（204）
export async function moveList(id: number, position: number): Promise<void> {
  const res = await fetch(`/api/lists/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'リストの移動に失敗しました'))
  }
}

// リストを削除する（DELETE /api/lists/{id}）。中のカードも DB から一緒に消える。成功すると本文なし（204）
export async function deleteList(id: number): Promise<void> {
  const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'リストの削除に失敗しました'))
  }
}

// カードを追加する（POST /api/cards）。リストのいちばん下に入る
export async function createCard(listId: number, content: string, priority: Priority): Promise<Card> {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, content, priority }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'カードの追加に失敗しました'))
  }
  return res.json()
}

// カードの内容と重要度を変える（PATCH /api/cards/{id}）。並び順と入っているリストは変わらない
export async function updateCard(id: number, content: string, priority: Priority): Promise<Card> {
  const res = await fetch(`/api/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, priority }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'カードの更新に失敗しました'))
  }
  return res.json()
}

// カードを並び替える・別のリストへ移す（PATCH /api/cards/{id}/move）
// position は、移動先のリストで上から何番目か（0 から数える）。成功すると本文なし（204）
export async function moveCard(id: number, listId: number, position: number): Promise<void> {
  const res = await fetch(`/api/cards/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, position }),
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'カードの移動に失敗しました'))
  }
}

// カードを削除する（DELETE /api/cards/{id}）。DB の行そのものが消える。成功すると本文なし（204）
export async function deleteCard(id: number): Promise<void> {
  const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error(await errorMessage(res, 'カードの削除に失敗しました'))
  }
}
