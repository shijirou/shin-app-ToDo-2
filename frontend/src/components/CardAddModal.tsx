import { useState } from 'react'
import type { FormEvent } from 'react'
import { createCard } from '../api'
import type { TaskList } from '../types'

type Props = {
  lists: TaskList[]
  initialListId: number // 最初に選んでおくリスト（「＋ カードを追加」を押したリスト）
  onClose: () => void
  onAdded: () => void // 追加に成功したときに呼ぶ
}

// カード追加モーダル（追加先リストと内容を入力して、POST で登録する）
function CardAddModal({ lists, initialListId, onClose, onAdded }: Props) {
  const [listId, setListId] = useState(initialListId)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = content.trim() !== '' && !saving

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await createCard(listId, content.trim()) // 前後の空白・改行は取り除いて送る
      onAdded()
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    // 後ろの暗い部分。ここを押しても閉じる
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <form
        className="w-80 rounded-md bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()} // モーダルの中を押しても閉じないようにする
        onSubmit={handleSubmit}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">カードを追加</h2>
          <button
            type="button"
            className="px-2 text-slate-500 hover:text-slate-800"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <label className="mb-1 block text-sm">追加先リスト</label>
        <select
          className="mb-3 w-full rounded border border-gray-300 p-2"
          value={listId}
          onChange={(e) => setListId(Number(e.target.value))}
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm">内容</label>
        <textarea
          className="mb-3 w-full rounded border border-gray-300 p-2"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        {error && <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 disabled:bg-gray-300"
            disabled={!canSubmit}
          >
            {saving ? '追加中…' : '追加'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CardAddModal
