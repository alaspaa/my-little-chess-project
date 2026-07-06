import type { BoardCoordinates, CHESS_PIECE_COLOR, ChessPiece, Square } from "../../types/ChessObjects";
import getValidMoves from "../MoveResolver";
import { BISHOP_DIRECTIONS, isOnBoard, isOpponentPiece, ROOK_DIRECTIONS, squareIsEmpty } from "./shared";

function getKingStepMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    const validMoves: BoardCoordinates[] = []

    for(const direction of [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS]) {
        const target = {x: currentCoordinates.x + direction.x, y: currentCoordinates.y + direction.y}
        if(!isOnBoard(target)) continue
        if(squareIsEmpty(gameBoard, target) || isOpponentPiece(gameBoard, target, piece.color)) {
            validMoves.push(target)
        }
    }

    return validMoves
}

// Kings only ever consider their plain step moves here, not castling -
// otherwise this would recurse into itself checking castling eligibility.
function isSquareAttacked(gameBoard: Square[][], coordinates: BoardCoordinates, byColor: CHESS_PIECE_COLOR): boolean {
    return gameBoard.some((row, y) =>
        row.some((square, x) => {
            const attacker = square.piece
            if(!attacker || attacker.color !== byColor) return false

            const attackerMoves = attacker.type === "KING"
                ? getKingStepMoves(gameBoard, {x, y}, attacker)
                : getValidMoves(gameBoard, {x, y}, attacker)

            return attackerMoves.some(move => move.x === coordinates.x && move.y === coordinates.y)
        })
    )
}

function getCastlingMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    if(piece.hasMoved) return []

    const { y } = currentCoordinates
    const opponentColor = piece.color === "white" ? "black" : "white"
    if(isSquareAttacked(gameBoard, currentCoordinates, opponentColor)) return []

    const castlingMoves: BoardCoordinates[] = []

    const kingsideRook = gameBoard[y][7].piece
    if(
        kingsideRook && kingsideRook.type === "ROOK" && !kingsideRook.hasMoved &&
        squareIsEmpty(gameBoard, {x: 5, y}) && squareIsEmpty(gameBoard, {x: 6, y}) &&
        !isSquareAttacked(gameBoard, {x: 5, y}, opponentColor) &&
        !isSquareAttacked(gameBoard, {x: 6, y}, opponentColor)
    ) {
        castlingMoves.push({x: 6, y})
    }

    const queensideRook = gameBoard[y][0].piece
    if(
        queensideRook && queensideRook.type === "ROOK" && !queensideRook.hasMoved &&
        squareIsEmpty(gameBoard, {x: 1, y}) && squareIsEmpty(gameBoard, {x: 2, y}) && squareIsEmpty(gameBoard, {x: 3, y}) &&
        !isSquareAttacked(gameBoard, {x: 2, y}, opponentColor) &&
        !isSquareAttacked(gameBoard, {x: 3, y}, opponentColor)
    ) {
        castlingMoves.push({x: 2, y})
    }

    return castlingMoves
}

function getKingMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return [
        ...getKingStepMoves(gameBoard, currentCoordinates, piece),
        ...getCastlingMoves(gameBoard, currentCoordinates, piece),
    ]
}

function isCastlingMove(piece: ChessPiece, from: BoardCoordinates, to: BoardCoordinates): boolean {
    return piece.type === "KING" && Math.abs(to.x - from.x) === 2
}

function getCastlingRookMove(kingDestinationX: number): {from: number, to: number} {
    return kingDestinationX === 6 ? {from: 7, to: 5} : {from: 0, to: 3}
}

export { getKingMoves, isSquareAttacked, isCastlingMove, getCastlingRookMove }
