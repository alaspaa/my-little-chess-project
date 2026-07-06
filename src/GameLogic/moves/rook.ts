import type { BoardCoordinates, ChessPiece, Square } from "../../types/ChessObjects";
import { getSlidingMoves, ROOK_DIRECTIONS } from "./shared";

function getRookMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, ROOK_DIRECTIONS)
}

export { getRookMoves }
