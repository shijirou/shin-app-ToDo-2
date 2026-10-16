import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { createCard } from '../api'
import type { Priority, TaskList } from '../types'
import Modal from './Modal'
import PrioritySelect from './PrioritySelect'

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
  const [priority, setPriority] = useState<Priority>('MEDIUM') // 最初は「中」
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listSelectId = useId() // 見出し（label）と入力欄をつなぐための名前
  const contentId = useId()

  const canSubmit = content.trim() !== '' && !saving

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await createCard(listId, content.trim(), priority) // 前後の空白・改行は取り除いて送る
      onAdded()
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <Modal title="カードを追加" onClose={onClose} onSubmit={handleSubmit}>
      <label htmlFor={listSelectId} className="mb-1 block text-sm">
        追加先リスト
      </label>
      <select
        id={listSelectId}
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

      <label htmlFor={contentId} className="mb-1 block text-sm">
        内容
      </label>
      <textarea
        id={contentId}
        className="mb-3 w-full rounded border border-gray-300 p-2"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
      />

      <PrioritySelect value={priority} onChange={setPriority} />

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
    </Modal>
  )
}

export default CardAddModal
