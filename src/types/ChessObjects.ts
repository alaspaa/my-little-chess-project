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

export enum CHESS_PIECE_COLOR {
  BLACK = "black",
  WHITE = "white",
}

export enum CHESS_PIECE_TYPE {
  PAWN = "PAWN",
  ROOK = "ROOK",
  KNIGHT = "KNIGHT",
  BISHOP = "BISHOP",
  QUEEN = "QUEEN",
  KING = "KING",
}