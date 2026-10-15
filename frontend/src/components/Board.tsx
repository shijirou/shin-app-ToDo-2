import type { Card, TaskList } from '../types'
import ListAddForm from './ListAddForm'
import ListColumn from './ListColumn'

type Props = {
  lists: TaskList[]
  onAddCard: (listId: number) => void // 「＋ カードを追加」を押したことを App に伝える
  onEditCard: (card: Card) => void // カードを押したことを App に伝える
  onListsChanged: () => void // リストの追加・名前の変更・削除に成功したことを App に伝える
}

// ボード全体（リストを横に並べ、右端に「＋ リストを追加」を置く）
function Board({ lists, onAddCard, onEditCard, onListsChanged }: Props) {
  return (
    <div className="flex items-start gap-3 overflow-x-auto p-4">
      {lists.map((list) => (
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
  )
}

export default Board
