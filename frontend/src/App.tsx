import { useEffect, useState } from 'react'
import { fetchBoard, moveCard, moveList } from './api'
import Board from './components/Board'
import CardAddModal from './components/CardAddModal'
import CardEditModal from './components/CardEditModal'
import type { Card, TaskList } from './types'

// 画面全体。最初に API からボードを読み込んで表示する
function App() {
  const [lists, setLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // カード追加モーダルで最初に選ぶリストの番号（null ならモーダルは閉じている）
  const [addingListId, setAddingListId] = useState<number | null>(null)
  // 編集中のカード（null なら編集モーダルは閉じている）
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  // 画面の上に出すお知らせ（カードの移動に失敗したときなど）
  const [notice, setNotice] = useState<string | null>(null)

  // ボードを API から読み込む（最初の表示と、カードを追加したあとに使う）
  function loadBoard() {
    return fetchBoard()
      .then((data) => {
        setLists(data)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => {
    loadBoard().finally(() => setLoading(false))
  }, [])

  // カードの追加に成功したら、モーダルを閉じてボードを読み直す
  function handleCardAdded() {
    setAddingListId(null)
    loadBoard()
  }

  // ドラッグ&ドロップしたら、先に画面を動かしてから保存する。
  // 保存に失敗したら、元の位置に戻してお知らせを出す（what は「カード」か「リスト」）
  function saveMove(newLists: TaskList[], save: () => Promise<void>, what: string) {
    const before = lists
    setLists(newLists)
    setNotice(null)
    save()
      .then(() => loadBoard()) // 保存できたら、念のため DB の内容で読み直す
      .catch((e: Error) => {
        setLists(before)
        setNotice(`${e.message}。${what}を元の位置に戻しました。`)
      })
  }

  function handleMoveCard(newLists: TaskList[], cardId: number, listId: number, position: number) {
    saveMove(newLists, () => moveCard(cardId, listId, position), 'カード')
  }

  function handleMoveList(newLists: TaskList[], listId: number, position: number) {
    saveMove(newLists, () => moveList(listId, position), 'リスト')
  }

  // カードの更新・削除に成功したら、モーダルを閉じてボードを読み直す
  function handleCardChanged() {
    setEditingCard(null)
    loadBoard()
  }

  return (
    <div className="min-h-screen bg-gray-100 text-slate-800">
      <header className="bg-sky-700 px-4 py-3 text-white">
        <h1 className="text-lg font-bold">Trello風タスクボード</h1>
      </header>
      {loading && <p className="p-4">読み込み中…</p>}
      {error && (
        <p className="m-4 rounded bg-red-100 p-3 text-red-700">
          {error}。バックエンドと DB が起動しているか確認してください。
        </p>
      )}
      {notice && (
        <p className="mx-4 mt-4 flex items-start justify-between gap-2 rounded bg-red-100 p-3 text-red-700">
          {notice}
          <button type="button" className="px-1" onClick={() => setNotice(null)} aria-label="お知らせを閉じる">
            ×
          </button>
        </p>
      )}
      {!loading && !error && (
        <Board
          lists={lists}
          onAddCard={setAddingListId}
          onEditCard={setEditingCard}
          onListsChanged={loadBoard}
          onMoveCard={handleMoveCard}
          onMoveList={handleMoveList}
        />
      )}
      {addingListId !== null && (
        <CardAddModal
          lists={lists}
          initialListId={addingListId}
          onClose={() => setAddingListId(null)}
          onAdded={handleCardAdded}
        />
      )}
      {editingCard !== null && (
        <CardEditModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onChanged={handleCardChanged}
        />
      )}
    </div>
  )
}

export default App
