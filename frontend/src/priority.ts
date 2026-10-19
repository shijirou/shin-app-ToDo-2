// カードの重要度の、画面での名前と色（機能9。高：赤、中：黄、低：青）
// 色の見分けがつきにくい人にも伝わるように、カードには色の帯と一緒に「高・中・低」の文字の札（badgeClass）も出す
import type { Priority } from './types'

export const PRIORITIES: { value: Priority; label: string; borderClass: string; badgeClass: string }[] = [
  { value: 'HIGH', label: '高', borderClass: 'border-l-red-500', badgeClass: 'bg-red-100 text-red-800' },
  { value: 'MEDIUM', label: '中', borderClass: 'border-l-yellow-400', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: '低', borderClass: 'border-l-blue-500', badgeClass: 'bg-blue-100 text-blue-800' },
]

export function priorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1]
}
