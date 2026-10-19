// dnd.ts（ドラッグ&ドロップの計算）のテスト。`npm test` で動く
import { describe, expect, test } from 'vitest'
import { findCardPlace, findListId, moveCardInLists, parseDndId } from './dnd'
import type { Card, TaskList } from './types'

const card = (id: number, content: string): Card => ({ id, content, priority: 'MEDIUM', position: 0 })

// テスト用のボード: ToDo [A, B, C] / 進行中 [D] / 完了 []
function board(): TaskList[] {
  return [
    { id: 1, name: 'ToDo', position: 0, cards: [card(1, 'A'), card(2, 'B'), card(3, 'C')] },
    { id: 2, name: '進行中', position: 1, cards: [card(4, 'D')] },
    { id: 3, name: '完了', position: 2, cards: [] },
  ]
}

// ボードを「リスト名: カードの並び」の形にして比べやすくする
const shape = (lists: TaskList[]) => lists.map((list) => `${list.name}: ${list.cards.map((c) => c.content).join('')}`)

describe('parseDndId', () => {
  test('ID から種類と番号を取り出す', () => {
    expect(parseDndId('card-3')).toEqual({ kind: 'card', id: 3 })
    expect(parseDndId('list-12')).toEqual({ kind: 'list', id: 12 })
  })
})

describe('findListId', () => {
  test('カードの ID なら、そのカードが入っているリストの番号を返す', () => {
    expect(findListId(board(), 'card-4')).toBe(2)
  })

  test('リストの ID なら、そのリストの番号を返す', () => {
    expect(findListId(board(), 'list-3')).toBe(3)
  })

  test('どこにもないカードなら null を返す', () => {
    expect(findListId(board(), 'card-99')).toBeNull()
  })
})

describe('findCardPlace', () => {
  test('カードのリストと、上から何番目かを返す', () => {
    expect(findCardPlace(board(), 3)).toEqual({ listId: 1, index: 2 })
  })

  test('どこにもないカードなら null を返す', () => {
    expect(findCardPlace(board(), 99)).toBeNull()
  })
})

describe('moveCardInLists', () => {
  test('同じリストの中で、いちばん下のカードを先頭へ動かす', () => {
    expect(shape(moveCardInLists(board(), 3, 1, 0))).toEqual(['ToDo: CAB', '進行中: D', '完了: '])
  })

  test('別のリストの指定した位置へ動かす', () => {
    expect(shape(moveCardInLists(board(), 2, 2, 0))).toEqual(['ToDo: AC', '進行中: BD', '完了: '])
  })

  test('カードが0枚のリストへも動かせる', () => {
    expect(shape(moveCardInLists(board(), 1, 3, 0))).toEqual(['ToDo: BC', '進行中: D', '完了: A'])
  })

  test('最後より後ろの位置なら、いちばん下に入れる', () => {
    expect(shape(moveCardInLists(board(), 1, 2, 100))).toEqual(['ToDo: BC', '進行中: DA', '完了: '])
  })

  test('元のボードは書きかえない（画面の表示を正しく更新するため）', () => {
    const before = board()
    moveCardInLists(before, 3, 2, 0)
    expect(shape(before)).toEqual(['ToDo: ABC', '進行中: D', '完了: '])
  })

  test('どこにもないカードなら、ボードをそのまま返す', () => {
    const before = board()
    expect(moveCardInLists(before, 99, 1, 0)).toBe(before)
  })
})
