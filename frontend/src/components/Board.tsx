import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { findCardPlace, findListId, moveCardInLists, parseDndId } from '../dnd'
import type { Card, TaskList } from '../types'
import { CardView } from './CardItem'
import ListAddForm from './ListAddForm'
import ListColumn from './ListColumn'

type Props = {
  lists: TaskList[]
  onAddCard: (listId: number) => void // 「＋ カードを追加」を押したことを App に伝える
  onEditCard: (card: Card) => void // カードを押したことを App に伝える
  onListsChanged: () => void // リストの追加・名前の変更・削除に成功したことを App に伝える
  // カードを落としたとき、動かしたあとのボードと、カードの行き先を App に伝える
  onMoveCard: (newLists: TaskList[], cardId: number, listId: number, position: number) => void
}

// 落とし先の決め方: マウスの先にあるカードを優先し、なければマウスの先のリスト。
// リストの外ならどこにも当たらない（落とすとカードは元の位置に戻る）
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  const cardHit = hits.find((hit) => parseDndId(hit.id).kind === 'card')
  return cardHit ? [cardHit] : hits
}

// ボード全体（リストを横に並べ、右端に「＋ リストを追加」を置く）。カードのドラッグ&ドロップもここで扱う
function Board({ lists, onAddCard, onEditCard, onListsChanged, onMoveCard }: Props) {
  // ドラッグ中だけ使う、画面に出すボード（カードを別のリストの上に持っていくと、その場で入れかえて見せる）
  const [dragLists, setDragLists] = useState<TaskList[] | null>(null)
  const [activeCard, setActiveCard] = useState<Card | null>(null) // つかんでいるカード
  const shown = dragLists ?? lists

  // 5px 以上動かしたときだけドラッグにする（ただ押しただけなら、今までどおり編集モーダルが開く）
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragStart({ active }: DragStartEvent) {
    const { id } = parseDndId(active.id)
    setDragLists(lists)
    setActiveCard(lists.flatMap((list) => list.cards).find((card) => card.id === id) ?? null)
  }

  // 別のリストの上に来たら、そのリストへ仮に移して見せる
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    setDragLists((prev) => {
      if (!prev) return prev
      const fromListId = findListId(prev, active.id)
      const toListId = findListId(prev, over.id)
      if (fromListId === null || toListId === null || fromListId === toListId) return prev
      const target = parseDndId(over.id)
      const toList = prev.find((list) => list.id === toListId)!
      // カードの上ならその位置、リストの上（すき間や見出し）ならいちばん下
      const index =
        target.kind === 'card' ? toList.cards.findIndex((card) => card.id === target.id) : toList.cards.length
      return moveCardInLists(prev, parseDndId(active.id).id, toListId, index)
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const current = dragLists
    setDragLists(null)
    setActiveCard(null)
    // リストの外に落としたときは、何もしない（元の位置に戻る）
    if (!over || !current) return

    const cardId = parseDndId(active.id).id
    const place = findCardPlace(current, cardId)
    if (!place) return
    // 同じリストの中で、別のカードの上に落としたら、その位置へ
    const target = parseDndId(over.id)
    let index = place.index
    if (target.kind === 'card' && target.id !== cardId) {
      const overIndex = current.find((list) => list.id === place.listId)!.cards.findIndex((c) => c.id === target.id)
      if (overIndex !== -1) index = overIndex
    }
    const newLists = moveCardInLists(current, cardId, place.listId, index)

    // 元の場所と同じなら、保存しない
    const before = findCardPlace(lists, cardId)
    if (before && before.listId === place.listId && before.index === index) return
    onMoveCard(newLists, cardId, place.listId, index)
  }

  function handleDragCancel() {
    setDragLists(null)
    setActiveCard(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex items-start gap-3 overflow-x-auto p-4">
        {shown.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onAddCard={onAddCard}
            onEditCard={onEditCard}
            onListChanged={onListsChanged}
          />
        ))}
        <ListAddForm onAdded={onListsChanged} />
      </div>
      {/* ドラッグ中、マウスについてくるカード */}
      <DragOverlay>{activeCard && <CardView card={activeCard} className="rotate-2 shadow-lg" />}</DragOverlay>
    </DndContext>
  )
}

export default Board
