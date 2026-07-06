import type { BoardCoordinates, CHESS_PIECE_COLOR, ChessPiece, Square } from "./ChessObjects";
import getValidMoves, { getCastlingRookMove, isCastlingMove, isSquareAttacked } from "./MoveValidator";

function validateMove(
    gameBoard: Square[][],
    currentCoordinates: BoardCoordinates,
    newCoordinates: BoardCoordinates,
    piece: ChessPiece
): boolean {
    const legalMoves = getLegalMoves(gameBoard, currentCoordinates, piece)
    return legalMoves.some(move => move.x === newCoordinates.x && move.y === newCoordinates.y)
}

function getLegalMoves(gameBoard: Square[][], currentCoordinates: BoardCoordinates, piece: ChessPiece): BoardCoordinates[] {
    const candidateMoves = getValidMoves(gameBoard, currentCoordinates, piece)
    return candidateMoves.filter(move => !moveLeavesKingInCheck(gameBoard, currentCoordinates, move, piece))
}

function moveLeavesKingInCheck(gameBoard: Square[][], from: BoardCoordinates, to: BoardCoordinates, piece: ChessPiece): boolean {
    const simulatedBoard = simulateMove(gameBoard, from, to, piece)
    return isKingInCheck(simulatedBoard, piece.color)
}

function simulateMove(gameBoard: Square[][], from: BoardCoordinates, to: BoardCoordinates, piece: ChessPiece): Square[][] {
    const newBoard = gameBoard.map(row => row.map(square => ({...square})))
    newBoard[from.y][from.x] = {piece: null}
    newBoard[to.y][to.x] = {piece}

    if(isCastlingMove(piece, from, to)) {
        const rookMove = getCastlingRookMove(to.x)
        const rook = newBoard[from.y][rookMove.from].piece
        newBoard[from.y][rookMove.from] = {piece: null}
        newBoard[from.y][rookMove.to] = {piece: rook}
    }

    return newBoard
}

function isKingInCheck(gameBoard: Square[][], color: CHESS_PIECE_COLOR): boolean {
    const kingCoordinates = findKingCoordinates(gameBoard, color)
    if(!kingCoordinates) return false

    const opponentColor = color === "white" ? "black" : "white"
    return isSquareAttacked(gameBoard, kingCoordinates, opponentColor)
}

function findKingCoordinates(gameBoard: Square[][], color: CHESS_PIECE_COLOR): BoardCoordinates | null {
    for(let y = 0; y < gameBoard.length; y++) {
        for(let x = 0; x < gameBoard[y].length; x++) {
            const piece = gameBoard[y][x].piece
            if(piece && piece.color === color && piece.type === "KING") {
                return {x, y}
            }
        }
    }
    return null
}

function isCheckmate(gameBoard: Square[][], color: CHESS_PIECE_COLOR): boolean {
    if(!isKingInCheck(gameBoard, color)) return false

    return !gameBoard.some((row, y) =>
        row.some((square, x) => {
            const piece = square.piece
            if(!piece || piece.color !== color) return false
            return getLegalMoves(gameBoard, {x, y}, piece).length > 0
        })
    )
}

export default validateMove
export { getLegalMoves, isKingInCheck, isCheckmate }
