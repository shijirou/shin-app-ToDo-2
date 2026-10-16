import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { deleteCard, updateCard } from '../api'
import type { Card, Priority } from '../types'
import Modal from './Modal'
import PrioritySelect from './PrioritySelect'

type Props = {
  card: Card // 編集するカード（今の内容を最初から入れておく）
  onClose: () => void
  onChanged: () => void // 更新または削除に成功したときに呼ぶ
}

// カード編集モーダル（内容を書き直して PATCH で更新する。削除もここから行う）
function CardEditModal({ card, onClose, onChanged }: Props) {
  const [content, setContent] = useState(card.content)
  const [priority, setPriority] = useState<Priority>(card.priority)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentId = useId() // 見出し（label）と入力欄をつなぐための名前

  const busy = saving || deleting // 保存中・削除中はどちらのボタンも押せない
  const trimmed = content.trim() // 前後の空白・改行は取り除いて送る
  // 内容か重要度のどちらかを変えたか。保存済みの内容も前後の空白を除いて比べる
  // （末尾に改行が入ったまま保存されているカードを、開いただけで「変えた」と扱わないように）
  const changed = trimmed !== card.content.trim() || priority !== card.priority
  // 空のとき・何も変えていないときは保存できない
  const canSubmit = trimmed !== '' && changed && !busy

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await updateCard(card.id, trimmed, priority)
      onChanged()
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  // 削除ボタン。確認して OK なら DB からカードを消す（元に戻せない）
  async function handleDelete() {
    if (busy) return
    if (!window.confirm('このカードを削除しますか？元に戻せません。')) return
    setDeleting(true)
    setError(null)
    try {
      await deleteCard(card.id)
      onChanged()
    } catch (err) {
      setError((err as Error).message)
      setDeleting(false)
    }
  }

  return (
    <Modal title="カードを編集" onClose={onClose} onSubmit={handleSubmit}>
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

      <div className="flex justify-between">
        <button
          type="submit"
          className="rounded bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 disabled:bg-gray-300"
          disabled={!canSubmit}
        >
          {saving ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-300"
          onClick={handleDelete}
          disabled={busy}
        >
          {deleting ? '削除中…' : '削除'}
        </button>
      </div>
    </Modal>
  )
}

export default CardEditModal
