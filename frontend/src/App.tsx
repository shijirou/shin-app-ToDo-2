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

  // 最初の読み込み。失敗したらボードの代わりにエラーを出す（［再読み込み］でやり直せる）
  function loadInitial() {
    fetchBoard()
      .then(setLists)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInitial()
  }, [])

  // エラーの［再読み込み］を押したとき。「読み込み中…」に戻してから読み直す
  function retryInitial() {
    setLoading(true)
    setError(null)
    loadInitial()
  }

  // 操作のあとの読み直し。失敗してもボードは消さず、上のお知らせで伝える
  function reloadBoard() {
    fetchBoard()
      .then((data) => {
        setLists(data)
        setNotice(null)
      })
      .catch((e: Error) =>
        setNotice(`${e.message}。画面が最新でないかもしれません。少し待ってから［再読み込み］を押してください。`),
      )
  }

  // カードの追加に成功したら、モーダルを閉じてボードを読み直す
  function handleCardAdded() {
    setAddingListId(null)
    reloadBoard()
  }

  // ドラッグ&ドロップしたら、先に画面を動かしてから保存する。
  // 保存に失敗したら、元の位置に戻してお知らせを出す（what は「カード」か「リスト」）
  function saveMove(newLists: TaskList[], save: () => Promise<void>, what: string) {
    const before = lists
    setLists(newLists)
    setNotice(null)
    // 保存できたら、念のため DB の内容で読み直す。
    // 読み直しの失敗を「保存の失敗」とまちがえないように、then の2つ目で保存の失敗だけを受け取る
    save().then(reloadBoard, (e: Error) => {
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

  // カードの更新に成功したら、モーダルを閉じてボードを読み直す
  function handleCardChanged() {
    setEditingCard(null)
    reloadBoard()
  }

  // 削除に成功したら、読み直しを待たずに画面からすぐ消してから読み直す
  // （読み直しに失敗しても、消したものが画面に残らないように）
  function handleCardDeleted(cardId: number) {
    setEditingCard(null)
    setLists((prev) => prev.map((list) => ({ ...list, cards: list.cards.filter((card) => card.id !== cardId) })))
    reloadBoard()
  }

  function handleListDeleted(listId: number) {
    setLists((prev) => prev.filter((list) => list.id !== listId))
    reloadBoard()
  }

  return (
    <div className="min-h-screen bg-gray-100 text-slate-800">
      <header className="bg-sky-700 px-4 py-3 text-white">
        <h1 className="text-lg font-bold">Trello風タスクボード</h1>
      </header>
      {loading && <p className="p-4">読み込み中…</p>}
      {error && (
        <div className="m-4 flex flex-wrap items-center gap-3 rounded bg-red-100 p-3 text-red-700">
          <p>{error}。バックエンドと DB が起動しているか確認してください。</p>
          <button type="button" className="rounded bg-white px-3 py-1 hover:bg-red-50" onClick={retryInitial}>
            再読み込み
          </button>
        </div>
      )}
      {notice && (
        <div className="mx-4 mt-4 flex items-start justify-between gap-2 rounded bg-red-100 p-3 text-red-700">
          <p>{notice}</p>
          <div className="flex shrink-0 gap-1">
            <button type="button" className="rounded bg-white px-3 py-1 hover:bg-red-50" onClick={reloadBoard}>
              再読み込み
            </button>
            <button type="button" className="px-1" onClick={() => setNotice(null)} aria-label="お知らせを閉じる">
              ×
            </button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <Board
          lists={lists}
          onAddCard={setAddingListId}
          onEditCard={setEditingCard}
          onListsChanged={reloadBoard}
          onListDeleted={handleListDeleted}
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
          onDeleted={handleCardDeleted}
        />
      )}
    </div>
  )
}

export default App
