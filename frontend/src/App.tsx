import { useEffect, useState } from 'react'
import { fetchBoard } from './api'
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
      {!loading && !error && (
        <Board lists={lists} onAddCard={setAddingListId} onEditCard={setEditingCard} />
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
