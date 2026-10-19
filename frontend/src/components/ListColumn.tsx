import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { deleteList, renameList } from '../api'
import { cardDndId, listDndId } from '../dnd'
import type { Card, TaskList } from '../types'
import CardItem from './CardItem'

type Props = {
  list: TaskList
  onAddCard: (listId: number) => void // 「＋ カードを追加」を押したとき
  onEditCard: (card: Card) => void // カードを押したとき
  onListChanged: () => void // リストの名前の変更に成功したとき
  onListDeleted: (listId: number) => void // リストの削除に成功したとき
}

// リスト1列（見出しと、中のカード）
function ListColumn({ list, onAddCard, onEditCard, onListChanged, onListDeleted }: Props) {
  const [menuOpen, setMenuOpen] = useState(false) // 「…」メニューが開いているか
  const [renaming, setRenaming] = useState(false) // 見出しが入力欄になっているか
  const [name, setName] = useState(list.name)
  const [busy, setBusy] = useState(false) // 保存中・削除中
  const [error, setError] = useState<string | null>(null)
  // リスト全体を、見出しをつかんで左右に動かせるようにする（機能10）。
  // 同時に「カードを落とせる場所」にもなる（カードが0枚のリストにも落とせるように）
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: listDndId(list.id),
  })

  const trimmed = name.trim() // 前後の空白は取り除いて送る
  // 空のとき・何も変えていないときは保存できない
  const canRename = trimmed !== '' && trimmed !== list.name && !busy

  function startRename() {
    setMenuOpen(false)
    setName(list.name)
    setError(null)
    setRenaming(true)
  }

  function cancelRename() {
    setRenaming(false)
    setName(list.name)
    setError(null)
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault() // ページの再読み込みを止める
    if (!canRename) return
    setBusy(true)
    setError(null)
    try {
      await renameList(list.id, trimmed)
      setRenaming(false)
      onListChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // 削除。確認して OK なら、リストと中のカードを DB から消す（元に戻せない）
  async function handleDelete() {
    setMenuOpen(false)
    if (busy) return
    const message = `リスト「${list.name}」を削除しますか？\n中のカード（${list.cards.length}枚）もすべて削除され、元に戻せません。`
    if (!window.confirm(message)) return
    setBusy(true)
    setError(null)
    try {
      await deleteList(list.id)
      onListDeleted(list.id) // 画面からすぐ消す（読み直しに失敗しても、消したリストが残らないように）
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <section
      ref={setNodeRef}
      // ドラッグ中、ほかのリストがよけるときの動き
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`w-64 shrink-0 rounded-md bg-gray-200 p-2 ${isDragging ? 'relative z-10 opacity-80 shadow-lg' : ''}`}
    >
      {renaming ? (
        <form className="mb-2 flex gap-1" onSubmit={handleRename}>
          <input
            className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 font-bold"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && !e.nativeEvent.isComposing && cancelRename()} // Esc でやめる（日本語の変換中は除く）
            autoFocus
          />
          <button
            type="submit"
            className="rounded bg-sky-700 px-2 text-sm text-white hover:bg-sky-800 disabled:bg-gray-300"
            disabled={!canRename}
          >
            保存
          </button>
          <button
            type="button"
            className="px-1 text-slate-500 hover:text-slate-800"
            onClick={cancelRename}
            aria-label="やめる"
          >
            ×
          </button>
        </form>
      ) : (
        <div className="relative flex items-center justify-between pb-2">
          {/* 見出しの名前の部分をつかむと、リストをドラッグできる。
              つかむための設定は h2 の中の span に付ける（h2 に付けると「見出し」ではなく「ボタン」扱いになってしまうため） */}
          <h2 className="flex-1 px-1 font-bold break-all">
            <span className="block cursor-grab" {...attributes} {...listeners}>
              {list.name}
            </span>
          </h2>
          <button
            type="button"
            className="rounded px-2 text-slate-500 hover:bg-gray-300 hover:text-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="リストのメニュー"
            disabled={busy}
          >
            …
          </button>
          {menuOpen && (
            <>
              {/* メニューの外を押したら閉じるための、見えない幕（キーボードでは「…」ボタンをもう一度押して閉じる） */}
              {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <ul className="absolute top-8 right-0 z-20 w-40 rounded bg-white py-1 text-sm shadow-lg">
                <li>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                    onClick={startRename}
                  >
                    名前を変更
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                    onClick={handleDelete}
                  >
                    リストを削除
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      )}
      {error && <p className="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {/* この中のカードは、ドラッグで上下に並び替えられる */}
      <SortableContext
        items={list.cards.map((card) => cardDndId(card.id))}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex min-h-2 flex-col gap-2">
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onEdit={onEditCard} />
          ))}
        </ul>
      </SortableContext>
      <button
        type="button"
        className="mt-2 w-full rounded px-2 py-1 text-left text-sm text-slate-600 hover:bg-gray-300"
        onClick={() => onAddCard(list.id)}
      >
        ＋ カードを追加
      </button>
    </section>
  )
}

export default ListColumn
