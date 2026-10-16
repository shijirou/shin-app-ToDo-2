import { useState } from 'react'
import type { FormEvent } from 'react'
import { createList } from '../api'

type Props = {
  onAdded: () => void // 追加に成功したときに呼ぶ
}

// ボードの右端の「＋ リストを追加」。押すと入力欄に変わる
function ListAddForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim() // 前後の空白は取り除いて送る
  const canSubmit = trimmed !== '' && !saving // 空のときは追加できない

  function close() {
    setOpen(false)
    setName('')
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await createList(trimmed)
      close()
      onAdded()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="w-64 shrink-0 rounded-md bg-gray-200/70 px-3 py-2 text-left text-slate-600 hover:bg-gray-300"
        onClick={() => setOpen(true)}
      >
        ＋ リストを追加
      </button>
    )
  }

  return (
    <form className="w-64 shrink-0 rounded-md bg-gray-200 p-2" onSubmit={handleSubmit}>
      <input
        className="mb-2 w-full rounded border border-gray-300 bg-white p-2"
        placeholder="リスト名"
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && !e.nativeEvent.isComposing && close()} // Esc でやめる（日本語の変換中は除く）
        autoFocus
      />
      {error && <p className="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-sky-700 px-3 py-1 text-white hover:bg-sky-800 disabled:bg-gray-300"
          disabled={!canSubmit}
        >
          {saving ? '追加中…' : '追加'}
        </button>
        <button
          type="button"
          className="rounded px-3 py-1 text-slate-600 hover:bg-gray-300"
          onClick={close}
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

export default ListAddForm
