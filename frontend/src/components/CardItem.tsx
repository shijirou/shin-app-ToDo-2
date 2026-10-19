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
      <CardView
        card={card}
        onClick={() => onEdit(card)} // マウスで押したとき・Enter キーを押したとき
        // スペースキーは「つかむ・置く」に使うので、離したときにボタンとして押された扱いにしない
        onKeyUp={(e) => e.key === ' ' && e.preventDefault()}
        {...attributes}
        {...listeners}
      />
    </li>
  )
}

type CardViewProps = ComponentProps<'button'> & { card: Card }

// カードの見た目。ドラッグ中にマウスについてくるカード（DragOverlay）でも使う
// 重要度は、左端の色の帯（高：赤、中：黄、低：青）と、右上の「高・中・低」の文字の札の両方で表す
export function CardView({ card, className = '', ...rest }: CardViewProps) {
  const p = priorityInfo(card.priority)
  return (
    <button
      type="button"
      className={`flex w-full cursor-grab items-start justify-between gap-2 rounded border-l-4 bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-sky-50 ${p.borderClass} ${className}`}
      {...rest}
    >
      <span className="min-w-0 whitespace-pre-wrap break-words">{card.content}</span>
      <span className={`shrink-0 rounded px-1.5 text-xs ${p.badgeClass}`}>
        {/* 読み上げソフトには「重要度：高」と読ませる（画面には「高」だけ出す） */}
        <span className="sr-only">重要度：</span>
        {p.label}
      </span>
    </button>
  )
}

export default CardItem
