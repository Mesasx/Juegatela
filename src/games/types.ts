export interface GameResult {
  youWin: boolean
  youScore: number
  oppScore: number
}

export interface GameComponentProps {
  difficulty?: number // 1 easy .. 3 hard (AI strength)
  onScore?: (you: number, opp: number) => void
  onResult: (r: GameResult) => void
  resetKey: number // change to force a fresh round
}
