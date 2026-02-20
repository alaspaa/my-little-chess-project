
import { type Square, chessPieceColor, chessPieceType, type chessPiece } from "./ChessObjects"

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
    board[1] = createFrontrow(chessPieceColor.WHITE, board[1])
    board[6] = createFrontrow(chessPieceColor.BLACK, board[6])
    //add white pawns
    
    board[0] = createBackrow(chessPieceColor.WHITE, board[0])
    board[7] = createBackrow(chessPieceColor.BLACK, board[7])
    
    return board
}

function createFrontrow(color: chessPieceColor, row: Square[]): Square[] {
    return row.map(square => {
        square.piece = createPawn(color)
        return square
    })
}  

function createBackrow(color: chessPieceColor, row: Square[]): Square[] {
    row[0].piece = createRook(color)
    row[7].piece = createRook(color)
    
    //add white knights
    row[1].piece = createKnight(color)
    row[6].piece = createKnight(color)

    //add white bishop
    row[2].piece = createBishop(color)
    row[5].piece = createBishop(color)
    
    //add white queen
    row[3].piece = createQueen(color)

    //add white king
    row[4].piece = createKing(color)

    return row
}

function createPawn(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.PAWN
    }
} 

function createRook(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.ROOK
    }
} 

function createKnight(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.KNIGHT
    }
} 

function createBishop(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.BISHOP
    }
} 

function createQueen(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.QUEEN
    }
} 

function createKing(color: chessPieceColor): chessPiece {
    return {
        color: color, 
        type: chessPieceType.KING
    }
} 

export { createEmptyBoard, populateBoardWithPieces }