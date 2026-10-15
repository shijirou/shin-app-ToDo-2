// API から受け取るデータの形（バックエンドの dto/CardResponse・ListResponse と同じ）

// カードの重要度（HIGH 高・MEDIUM 中・LOW 低）。バックエンドの entity/Priority と同じ
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export type Card = {
  id: number
  content: string
  priority: Priority
  position: number
}

export type TaskList = {
  id: number
  name: string
  position: number
  cards: Card[]
}
