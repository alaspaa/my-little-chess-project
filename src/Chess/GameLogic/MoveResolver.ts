import type { BoardCoordinates, ChessPiece, Square } from "../types/ChessObjects";
import { getBishopMoves } from "./moves/bishop";
import { getKingMoves, getCastlingRookMove, isCastlingMove, isSquareAttacked } from "./moves/king";
import { getKnightMoves } from "./moves/knight";
import { getPawnMoves, isPawnPromotion, isEnPassantMove, getEnPassantCapturedPawnCoordinates, getPawnDoubleStepTarget } from "./moves/pawn";
import { getQueenMoves } from "./moves/queen";
import { getRookMoves } from "./moves/rook";

function getValidMoves(
    gameBoard: Square[][],
    currentCoordinates: BoardCoordinates,
    piece: ChessPiece,
    enPassantTarget: BoardCoordinates | null = null
): BoardCoordinates[] {
    switch(piece.type) {
        case "PAWN":
            return getPawnMoves(gameBoard, currentCoordinates, piece, enPassantTarget)
        case "ROOK":
            return getRookMoves(gameBoard, currentCoordinates, piece)
        case "KNIGHT":
            return getKnightMoves(gameBoard, currentCoordinates, piece)
        case "BISHOP":
            return getBishopMoves(gameBoard, currentCoordinates, piece)
        case "QUEEN":
            return getQueenMoves(gameBoard, currentCoordinates, piece)
        case "KING":
            return getKingMoves(gameBoard, currentCoordinates, piece)
        default:
            return []
    }
}

export default getValidMoves
export {
    isPawnPromotion,
    isSquareAttacked,
    isCastlingMove,
    getCastlingRookMove,
    isEnPassantMove,
    getEnPassantCapturedPawnCoordinates,
    getPawnDoubleStepTarget,
}
