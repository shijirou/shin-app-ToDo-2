import type { Card } from '../types'

// カード1枚
function CardItem({ card }: { card: Card }) {
  return (
    <li className="rounded bg-white px-3 py-2 text-sm shadow-sm">
      {card.content}
    </li>
  )
}

export default CardItem
