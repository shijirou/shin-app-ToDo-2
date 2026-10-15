import { PRIORITIES } from '../priority'
import type { Priority } from '../types'

type Props = {
  value: Priority
  onChange: (value: Priority) => void
}

// 重要度の選択欄（カード追加・編集モーダルで使う）
function PrioritySelect({ value, onChange }: Props) {
  return (
    <>
      <label className="mb-1 block text-sm">重要度</label>
      <select
        className="mb-3 w-full rounded border border-gray-300 p-2"
        value={value}
        onChange={(e) => onChange(e.target.value as Priority)}
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </>
  )
}

export default PrioritySelect
