
import { type Square, type CHESS_PIECE_COLOR, type ChessPiece } from "./ChessObjects"

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
    board[1] = createFrontrow("white", board[1])
    board[6] = createFrontrow("black", board[6])
    //add white pawns
    
    board[0] = createBackrow("white", board[0])
    board[7] = createBackrow("black", board[7])
    
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
        type: "PAWN",
        hasMoved: false
    }
} 

function createRook(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}rook${index}`,
        color: color, 
        type: "ROOK",
        hasMoved: false
    }
} 

function createKnight(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}knight${index}`,
        color: color, 
        type: "KNIGHT",
        hasMoved: false
    }
} 

function createBishop(color: CHESS_PIECE_COLOR, index: number): ChessPiece {
    return {
        id: `${color}bishop${index}`,
        color: color, 
        type: "BISHOP",
        hasMoved: false
    }
} 

function createQueen(color: CHESS_PIECE_COLOR): ChessPiece {
    return {
        id: `${color}queen`,
        color: color, 
        type: "QUEEN",
        hasMoved: false
    }
} 

function createKing(color: CHESS_PIECE_COLOR): ChessPiece {
    return {
        id: `${color}king`,
        color: color, 
        type: "KING",
        hasMoved: false
    }
} 

export { createEmptyBoard, populateBoardWithPieces }