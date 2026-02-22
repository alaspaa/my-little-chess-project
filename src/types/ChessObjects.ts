export type Square = {
  piece: ChessPiece | null
}

export type ChessPiece = {
  id: string,
  color: CHESS_PIECE_COLOR,
  type: CHESS_PIECE_TYPE,
}

export type BoardCoordinates = {
  x: number,
  y: number
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
