import type { TaskList } from '../types'
import ListColumn from './ListColumn'

// ボード全体（リストを横に並べる）
function Board({ lists }: { lists: TaskList[] }) {
  return (
    <div className="flex items-start gap-3 overflow-x-auto p-4">
      {lists.map((list) => (
        <ListColumn key={list.id} list={list} />
      ))}
    </div>
  )
}

export default Board
