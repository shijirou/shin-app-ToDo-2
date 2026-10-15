import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateCard } from '../api'
import type { Card } from '../types'

type Props = {
  card: Card // 編集するカード（今の内容を最初から入れておく）
  onClose: () => void
  onUpdated: () => void // 更新に成功したときに呼ぶ
}

// カード編集モーダル（内容を書き直して、PATCH で更新する）
function CardEditModal({ card, onClose, onUpdated }: Props) {
  const [content, setContent] = useState(card.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = content.trim() // 前後の空白・改行は取り除いて送る
  // 空のとき・何も変えていないときは保存できない
  const canSubmit = trimmed !== '' && trimmed !== card.content && !saving

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await updateCard(card.id, trimmed)
      onUpdated()
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
          <h2 className="font-bold">カードを編集</h2>
          <button
            type="button"
            className="px-2 text-slate-500 hover:text-slate-800"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

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
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CardEditModal
