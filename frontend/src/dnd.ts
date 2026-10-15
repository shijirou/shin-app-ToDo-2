// ドラッグ&ドロップ（dnd-kit）で使う、名前（ID）の付け方と計算をまとめたファイル
// dnd-kit では、つかむもの・落とす場所のすべてに ID を付ける。
// カードとリストの番号がかぶらないように、「card-3」「list-1」のように頭に種類を付ける
import type { TaskList } from './types'

export const cardDndId = (id: number) => `card-${id}`
export const listDndId = (id: number) => `list-${id}`

// ID から種類と番号を取り出す（例: "card-3" → { kind: 'card', id: 3 }）
export function parseDndId(dndId: string | number): { kind: 'card' | 'list'; id: number } {
  const [kind, id] = String(dndId).split('-')
  return { kind: kind === 'list' ? 'list' : 'card', id: Number(id) }
}

// ID（カードでもリストでもよい）から、それが入っているリストの番号を探す
export function findListId(lists: TaskList[], dndId: string | number): number | null {
  const { kind, id } = parseDndId(dndId)
  if (kind === 'list') return id
  return lists.find((list) => list.cards.some((card) => card.id === id))?.id ?? null
}

// カードの場所（リストの番号と、上から何番目か）を探す
export function findCardPlace(lists: TaskList[], cardId: number): { listId: number; index: number } | null {
  for (const list of lists) {
    const index = list.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) return { listId: list.id, index }
  }
  return null
}

// カードを、指定したリストの index 番目へ動かした「新しいボード」を作る（元のデータは変えない）
export function moveCardInLists(lists: TaskList[], cardId: number, toListId: number, toIndex: number): TaskList[] {
  const card = lists.flatMap((list) => list.cards).find((c) => c.id === cardId)
  if (!card) return lists
  // 1. いったん、どこからもカードを取り除く
  const removed = lists.map((list) => ({ ...list, cards: list.cards.filter((c) => c.id !== cardId) }))
  // 2. 移動先のリストの index 番目に差し込む
  return removed.map((list) => {
    if (list.id !== toListId) return list
    const cards = [...list.cards]
    cards.splice(Math.min(toIndex, cards.length), 0, card)
    return { ...list, cards }
  })
}
