import type { TaskList } from '../types'
import ListColumn from './ListColumn'

type Props = {
  lists: TaskList[]
  onAddCard: (listId: number) => void // 「＋ カードを追加」を押したことを App に伝える
}

// ボード全体（リストを横に並べる）
function Board({ lists, onAddCard }: Props) {
  return (
    <div className="flex items-start gap-3 overflow-x-auto p-4">
      {lists.map((list) => (
        <ListColumn key={list.id} list={list} onAddCard={onAddCard} />
      ))}
    </div>
  )
}

export default Board
