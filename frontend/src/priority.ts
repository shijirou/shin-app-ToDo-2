// カードの重要度の、画面での名前と色（機能9。高：赤、中：黄、低：青）
import type { Priority } from './types'

export const PRIORITIES: { value: Priority; label: string; borderClass: string }[] = [
  { value: 'HIGH', label: '高', borderClass: 'border-l-red-500' },
  { value: 'MEDIUM', label: '中', borderClass: 'border-l-yellow-400' },
  { value: 'LOW', label: '低', borderClass: 'border-l-blue-500' },
]

export function priorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1]
}
