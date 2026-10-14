import { useEffect, useState } from 'react'
import { fetchBoard } from './api'
import Board from './components/Board'
import type { TaskList } from './types'

// 画面全体。最初に API からボードを読み込んで表示する
function App() {
  const [lists, setLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoard()
      .then(setLists)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
      {!loading && !error && <Board lists={lists} />}
    </div>
  )
}

export default App
