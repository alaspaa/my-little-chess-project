import type { BoardCoordinates, ChessPiece, Square } from "../../types/ChessObjects";
import { isOnBoard, isOpponentPiece, squareIsEmpty } from "./shared";

const KNIGHT_OFFSETS = [
    {x: 1, y: 2}, {x: 2, y: 1}, {x: 2, y: -1}, {x: 1, y: -2},
    {x: -1, y: -2}, {x: -2, y: -1}, {x: -2, y: 1}, {x: -1, y: 2},
]

function getKnightMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    const validMoves: BoardCoordinates[] = []

    for(const offset of KNIGHT_OFFSETS) {
        const target = {x: currentCoordinates.x + offset.x, y: currentCoordinates.y + offset.y}
        if(!isOnBoard(target)) continue
        if(squareIsEmpty(gameBoard, target) || isOpponentPiece(gameBoard, target, piece.color)) {
            validMoves.push(target)
        }
    }

    return validMoves
}

export { getKnightMoves }
