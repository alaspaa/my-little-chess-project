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

export default getValidMoves
export { isPawnPromotion, isSquareAttacked, isCastlingMove, getCastlingRookMove }
