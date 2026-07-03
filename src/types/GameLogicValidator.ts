import type { BoardCoordinates, ChessPiece, Square } from "./ChessObjects";
import getValidMoves from "./MoveValidator";

function validateMove(
    gameBoard: Square[][],
    currentCoordinates: BoardCoordinates,
    newCoordinates: BoardCoordinates,
    piece: ChessPiece
): boolean {
    const validMoves = getValidMoves(gameBoard, currentCoordinates, piece)
    return validMoves.some(move => move.x === newCoordinates.x && move.y === newCoordinates.y)
}

export default validateMove
