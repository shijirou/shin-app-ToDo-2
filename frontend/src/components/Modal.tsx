import { useEffect, useId, useRef } from 'react'
import type { FormEvent, ReactNode } from 'react'

type Props = {
  title: string // モーダルの見出し
  onClose: () => void // ［×］・Esc・後ろの暗い部分で閉じるとき
  onSubmit: (e: FormEvent) => void // フォームを送ったとき（Enter や［追加］［保存］）
  children: ReactNode // 入力欄やボタン。最初にカーソルを置く欄には data-autofocus を付ける
}

// モーダル（画面の上に重ねて出す小さな画面）の共通部品。カード追加・編集モーダルで使う
// - HTML の <dialog> を showModal() で開く。後ろの画面は操作できなくなり、Tab キーでも後ろへ移らない
// - 読み上げソフトにも「モーダルの画面」と伝わる（<dialog> が自動で伝える）
// - Esc キーでも閉じられる
function Modal({ title, onClose, onSubmit, children }: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // 開いたら、モーダルとして表示して、data-autofocus の欄にカーソルを置く
  // （React の autoFocus は showModal() より先に動いてしまい、カーソルが別の所へ移るため使わない）
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 日本語入力の変換中の Esc は「変換をやめる」操作なので、モーダルは閉じない
      if (e.key === 'Escape' && !e.isComposing) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown) // 閉じたら見張りをやめる
  }, [onClose])

  return (
    // 後ろの暗い部分（::backdrop）を押すと、押された場所は <dialog> 自身になる。そのときだけ閉じる
    // （中身は内側の div が全部おおっているので、中を押しても閉じない。キーボードでは Esc で閉じられる）
    // 「押した場所」で判定するので、入力欄で文字を選びながら外までドラッグしても閉じない
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-80 rounded-md bg-white p-0 text-slate-800 shadow-lg backdrop:bg-black/40"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      // Esc を押したときにブラウザが自分で閉じないようにする（閉じるのは上の keydown の見張りに任せる。
      // そうしないと、日本語の変換中の Esc でも閉じてしまうことがある）
      onCancel={(e) => e.preventDefault()}
      // それでもブラウザが閉じたとき（Esc を続けて押したときなど）は、画面の状態もそろえる
      onClose={onClose}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 id={titleId} className="font-bold">
            {title}
          </h2>
          <button
            type="button"
            className="px-2 text-slate-500 hover:text-slate-800"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>{children}</form>
      </div>
    </dialog>
  )
}

export default Modal
