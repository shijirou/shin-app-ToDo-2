import { useEffect, useId } from 'react'
import type { FormEvent, ReactNode } from 'react'

type Props = {
  title: string // モーダルの見出し
  onClose: () => void // ［×］・Esc・後ろの暗い部分で閉じるとき
  onSubmit: (e: FormEvent) => void // フォームを送ったとき（Enter や［追加］［保存］）
  children: ReactNode // 入力欄やボタン
}

// モーダル（画面の上に重ねて出す小さな画面）の共通部品。カード追加・編集モーダルで使う
// - 読み上げソフトにも「モーダルの画面」と伝わるように role="dialog" と見出しを付ける
// - Esc キーでも閉じられる
function Modal({ title, onClose, onSubmit, children }: Props) {
  const titleId = useId()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 日本語入力の変換中の Esc は「変換をやめる」操作なので、モーダルは閉じない
      if (e.key === 'Escape' && !e.isComposing) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown) // 閉じたら見張りをやめる
  }, [onClose])

  return (
    // 後ろの暗い部分。ここでマウスを押すと閉じる（キーボードでは Esc で閉じられる）。
    // 「押した場所」で判定するので、入力欄で文字を選びながら外までドラッグしても閉じない
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* HTML の <dialog> を使うのが一番よい（Tab で後ろへ移らない仕組みも付く）が、autoFocus との組み合わせに
          手直しが要るため、今は div に role="dialog" を付けている（docs/quality-review.md の「今後の改善」参照） */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-80 rounded-md bg-white p-4 shadow-lg">
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
    </div>
  )
}

export default Modal
