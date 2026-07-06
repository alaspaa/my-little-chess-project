import type { BoardCoordinates, CHESS_PIECE_COLOR, ChessPiece, Square } from "../../types/ChessObjects";

function isOnBoard(coordinates: BoardCoordinates): boolean {
    return coordinates.x >= 0 && coordinates.x <= 7 && coordinates.y >= 0 && coordinates.y <= 7
}

function squareIsEmpty(gameBoard: Square[][], coordinates: BoardCoordinates): boolean {
    return !gameBoard[coordinates.y][coordinates.x].piece
}

function isOpponentPiece(gameBoard: Square[][], coordinates: BoardCoordinates, color: CHESS_PIECE_COLOR): boolean {
    const occupant = gameBoard[coordinates.y][coordinates.x].piece
    return !!occupant && occupant.color !== color
}

const ROOK_DIRECTIONS = [
    {x: 0, y: 1},
    {x: 0, y: -1},
    {x: 1, y: 0},
    {x: -1, y: 0},
]

const BISHOP_DIRECTIONS = [
    {x: 1, y: 1},
    {x: 1, y: -1},
    {x: -1, y: 1},
    {x: -1, y: -1},
]

function getSlidingMoves(
    gameBoard: Square[][],
    currentCoordinates: BoardCoordinates,
    piece: ChessPiece,
    directions: BoardCoordinates[]
): BoardCoordinates[] {
    const validMoves: BoardCoordinates[] = []

    for(const direction of directions) {
        let next = {x: currentCoordinates.x + direction.x, y: currentCoordinates.y + direction.y}
        while(isOnBoard(next)) {
            if(squareIsEmpty(gameBoard, next)) {
                validMoves.push(next)
            } else {
                if(isOpponentPiece(gameBoard, next, piece.color)) {
                    validMoves.push(next)
                }
                break
            }
            next = {x: next.x + direction.x, y: next.y + direction.y}
        }
    }

    return validMoves
}

export { isOnBoard, squareIsEmpty, isOpponentPiece, ROOK_DIRECTIONS, BISHOP_DIRECTIONS, getSlidingMoves }
