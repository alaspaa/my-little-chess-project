import type { BoardCoordinates, ChessPiece, Square } from "../../types/ChessObjects";
import { isOnBoard, isOpponentPiece, squareIsEmpty } from "./shared";

function getPawnMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    const validMoves: BoardCoordinates[] = []
    const direction = piece.color === "white" ? 1 : -1

    const oneStep = {x: currentCoordinates.x, y: currentCoordinates.y + direction}
    const oneStepClear = isOnBoard(oneStep) && squareIsEmpty(gameBoard, oneStep)
    if(oneStepClear) {
        validMoves.push(oneStep)
    }

    const twoStep = {x: currentCoordinates.x, y: currentCoordinates.y + direction * 2}
    if(!piece.hasMoved && oneStepClear && isOnBoard(twoStep) && squareIsEmpty(gameBoard, twoStep)) {
        validMoves.push(twoStep)
    }

    const captureLeft = {x: currentCoordinates.x - 1, y: currentCoordinates.y + direction}
    const captureRight = {x: currentCoordinates.x + 1, y: currentCoordinates.y + direction}
    for(const capture of [captureLeft, captureRight]) {
        if(isOnBoard(capture) && isOpponentPiece(gameBoard, capture, piece.color)) {
            validMoves.push(capture)
        }
    }

    return validMoves
}

function isPawnPromotion(piece: ChessPiece, destination: BoardCoordinates): boolean {
    if(piece.type !== "PAWN") return false
    return piece.color === "white" ? destination.y === 7 : destination.y === 0
}

export { getPawnMoves, isPawnPromotion }
