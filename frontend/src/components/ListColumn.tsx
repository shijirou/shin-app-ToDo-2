import type { TaskList } from '../types'
import CardItem from './CardItem'

// リスト1列（見出しと、中のカード）
function ListColumn({ list }: { list: TaskList }) {
  return (
    <section className="w-64 shrink-0 rounded-md bg-gray-200 p-2">
      <h2 className="px-1 pb-2 font-bold">{list.name}</h2>
      <ul className="flex flex-col gap-2">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </ul>
    </section>
  )
}

export default ListColumn
