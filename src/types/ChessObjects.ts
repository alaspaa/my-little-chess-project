export type Square = {
  piece: chessPiece | null
}

export type chessPiece = {
  color: chessPieceColor,
  type: chessPieceType,
}

export enum chessPieceColor {
  BLACK = "black",
  WHITE = "white",
}

export enum chessPieceType {
  PAWN = "PAWN",
  ROOK = "ROOK",
  KNIGHT = "KNIGHT",
  BISHOP = "BISHOP",
  QUEEN = "QUEEN",
  KING = "KING",
}