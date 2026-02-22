import type { BoardCoordinates, ChessPiece, Square } from "./ChessObjects";


function validateMove(
    gameBoard: Square[][], 
    currentCoordinates: BoardCoordinates, 
    newCoordinates: BoardCoordinates, 
    piece: ChessPiece
): boolean {  
    switch(piece.type) {
        case "PAWN":
            return validatePawnMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "ROOK":
            return validateRookMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "KNIGHT":
            return validateKnightMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "BISHOP":
            return validateBishopMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "QUEEN":
            return validateQueenMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "KING":
            return validateKingMove(gameBoard, currentCoordinates, newCoordinates, piece)
        default:            
            return false
    }
}

function validatePawnMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

function validateRookMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

function validateKnightMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

function validateBishopMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

function validateQueenMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

function validateKingMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    return true
}

export default validateMove