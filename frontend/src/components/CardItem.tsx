import type { Card } from '../types'

type Props = {
  card: Card
  onEdit: (card: Card) => void // カードを押したとき（編集モーダルを開く）
}

// カード1枚。押すと編集モーダルが開く
function CardItem({ card, onEdit }: Props) {
  return (
    <li>
      <button
        type="button"
        className="w-full whitespace-pre-wrap rounded bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-sky-50"
        onClick={() => onEdit(card)}
      >
        {card.content}
      </button>
    </li>
  )
}

export default CardItem
