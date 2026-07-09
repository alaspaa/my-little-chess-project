import type { BoardCoordinates, ChessPiece, Square } from "../../types/ChessObjects";
import { BISHOP_DIRECTIONS, getSlidingMoves } from "./shared";

function getBishopMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, BISHOP_DIRECTIONS)
}

export { getBishopMoves }
