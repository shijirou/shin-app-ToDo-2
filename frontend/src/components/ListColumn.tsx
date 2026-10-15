import type { TaskList } from '../types'
import CardItem from './CardItem'

type Props = {
  list: TaskList
  onAddCard: (listId: number) => void // 「＋ カードを追加」を押したとき
}

// リスト1列（見出しと、中のカード）
function ListColumn({ list, onAddCard }: Props) {
  return (
    <section className="w-64 shrink-0 rounded-md bg-gray-200 p-2">
      <h2 className="px-1 pb-2 font-bold">{list.name}</h2>
      <ul className="flex flex-col gap-2">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-gray-300"
        onClick={() => onAddCard(list.id)}
      >
        ＋ カードを追加
      </button>
    </section>
  )
}

export default ListColumn
