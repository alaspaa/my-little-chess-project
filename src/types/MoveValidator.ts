import type { BoardCoordinates, CHESS_PIECE_COLOR, ChessPiece, Square } from "./ChessObjects";

function getValidMoves(
    gameBoard: Square[][],
    currentCoordinates: BoardCoordinates,
    piece: ChessPiece
): BoardCoordinates[] {
    switch(piece.type) {
        case "PAWN":
            return getPawnMoves(gameBoard, currentCoordinates, piece)
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

function getRookMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, ROOK_DIRECTIONS)
}

function getBishopMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, BISHOP_DIRECTIONS)
}

function getQueenMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    return getSlidingMoves(gameBoard, currentCoordinates, piece, [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS])
}

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

function getKingMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
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

export default getValidMoves
export { isPawnPromotion }
