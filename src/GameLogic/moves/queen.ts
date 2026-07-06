import type { BoardCoordinates, ChessPiece, Square } from "../../types/ChessObjects";
import { BISHOP_DIRECTIONS, getSlidingMoves, ROOK_DIRECTIONS } from "./shared";

function getQueenMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS])
}

export { getQueenMoves }
