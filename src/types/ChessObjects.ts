export type Square = {
  piece: ChessPiece | null
}

export type Player = {
  id: string,
  name: string,
}

// Keyed by player slot (whoever started as White/Black in the first game),
// not color - so a future "switch sides on rematch" feature doesn't
// invalidate the tally.
export type Score = {
  player1: number,
  player2: number,
  draws: number,
}

export type ChessPiece = {
  id: string,
  hasMoved: boolean,
  color: CHESS_PIECE_COLOR,
  type: CHESS_PIECE_TYPE,
}

export type BoardCoordinates = {
  x: number,
  y: number
}

export type PendingPromotion = {
  color: CHESS_PIECE_COLOR,
  coordinates: BoardCoordinates,
}

export type CHESS_PIECE_COLOR =
  "black" |
  "white"


export type CHESS_PIECE_TYPE =
  "PAWN" |
  "ROOK" |
  "KNIGHT" |
  "BISHOP" |
  "QUEEN" |
  "KING"
