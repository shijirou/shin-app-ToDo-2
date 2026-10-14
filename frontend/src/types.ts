// API から受け取るデータの形（バックエンドの dto/CardResponse・ListResponse と同じ）

export type Card = {
  id: number
  content: string
  position: number
}

export type TaskList = {
  id: number
  name: string
  position: number
  cards: Card[]
}
