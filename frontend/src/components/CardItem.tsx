import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ComponentProps } from 'react'
import type { Card } from '../types'
import { cardDndId } from '../dnd'
import { priorityInfo } from '../priority'

type Props = {
  card: Card
  onEdit: (card: Card) => void // カードを押したとき（編集モーダルを開く）
}

// カード1枚。押すと編集モーダルが開き、つかんで動かすとドラッグできる
function CardItem({ card, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cardDndId(card.id),
  })

  return (
    <li
      ref={setNodeRef}
      // ドラッグ中、ほかのカードがよけるときの動き
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // ドラッグ中のカードの元の場所は、うすく表示して「ここから動かしている」とわかるようにする
      className={isDragging ? 'opacity-40' : ''}
    >
      <CardView card={card} onClick={() => onEdit(card)} {...attributes} {...listeners} />
    </li>
  )
}

type CardViewProps = ComponentProps<'button'> & { card: Card }

// カードの見た目。ドラッグ中にマウスについてくるカード（DragOverlay）でも使う
// 左端の色の帯で重要度を表す（高：赤、中：黄、低：青）
export function CardView({ card, className = '', ...rest }: CardViewProps) {
  const p = priorityInfo(card.priority)
  return (
    <button
      type="button"
      title={`重要度：${p.label}`} // マウスを乗せると重要度の名前が出る
      className={`w-full cursor-grab whitespace-pre-wrap rounded border-l-4 bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-sky-50 ${p.borderClass} ${className}`}
      {...rest}
    >
      {card.content}
    </button>
  )
}

export default CardItem
