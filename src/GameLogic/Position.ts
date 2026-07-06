import type { CHESS_PIECE_COLOR, CHESS_PIECE_TYPE, Square } from "../types/ChessObjects";

const PIECE_LETTERS: Record<CHESS_PIECE_TYPE, string> = {
    PAWN: "P",
    ROOK: "R",
    KNIGHT: "N",
    BISHOP: "B",
    QUEEN: "Q",
    KING: "K",
}

// Board + side-to-move only, per specs/architecture.md - castling/en
// passant rights aren't tracked yet, so two positions that only differ in
// those rights are (for now) treated as the same position.
function serializePosition(gameBoard: Square[][], turn: CHESS_PIECE_COLOR): string {
    const boardKey = gameBoard.map(row =>
        row.map(square => {
            const piece = square.piece
            if(!piece) return "--"
            return (piece.color === "white" ? "w" : "b") + PIECE_LETTERS[piece.type]
        }).join("")
    ).join("/")

    return `${boardKey}:${turn}`
}

export { serializePosition }
