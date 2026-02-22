
import { type Square, CHESS_PIECE_COLOR, CHESS_PIECE_TYPE, type ChessPiece } from "./ChessObjects"

function createEmptyBoard(): Square[][] {
  return [
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]
}

function createEmptyRow(): Square[] {
  return [
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
    createEmptySquare(),
  ]
}

function createEmptySquare(): Square {
  return {piece: null}
}

function populateBoardWithPieces(board: Square[][]): Square[][] {
    board[1] = createFrontrow(CHESS_PIECE_COLOR.WHITE, board[1])
    board[6] = createFrontrow(CHESS_PIECE_COLOR.BLACK, board[6])
    //add white pawns
    
    board[0] = createBackrow(CHESS_PIECE_COLOR.WHITE, board[0])
    board[7] = createBackrow(CHESS_PIECE_COLOR.BLACK, board[7])
    
    return board
}

function createFrontrow(color: CHESS_PIECE_COLOR, row: Square[]): Square[] {
    return row.map((square, index) => {
        square.piece = createPawn(color, index)
        return square
    })
}  

function createBackrow(color: CHESS_PIECE_COLOR, row: Square[]): Square[] {
    row[0].piece = createRook(color, 0)
    row[7].piece = createRook(color, 1)
    
    //add white knights
    row[1].piece = createKnight(color, 0)
    row[6].piece = createKnight(color, 1)

    //add white bishop
    row[2].piece = createBishop(color, 0)
    row[5].piece = createBishop(color, 1)
    
    //add white queen
    row[3].piece = createQueen(color)

    //add white king
    row[4].piece = createKing(color)

    return row
}

function createPawn(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}pawn${index}`,
        color: color, 
        type: CHESS_PIECE_TYPE.PAWN
    }
} 

function createRook(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}rook${index}`,
        color: color, 
        type: CHESS_PIECE_TYPE.ROOK
    }
} 

function createKnight(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}knight${index}`,
        color: color, 
        type: CHESS_PIECE_TYPE.KNIGHT
    }
} 

function createBishop(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}bishop${index}`,
        color: color, 
        type: CHESS_PIECE_TYPE.BISHOP
    }
} 

function createQueen(color: CHESS_PIECE_COLOR): ChessPiece {
    return {
        id: `${color}queen`,
        color: color, 
        type: CHESS_PIECE_TYPE.QUEEN
    }
} 

function createKing(color: CHESS_PIECE_COLOR): ChessPiece {
    return {
        id: `${color}king`,
        color: color, 
        type: CHESS_PIECE_TYPE.KING
    }
} 

export { createEmptyBoard, populateBoardWithPieces }