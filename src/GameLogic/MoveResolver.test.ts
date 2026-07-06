import { describe, expect, it } from "vitest"
import getValidMoves from "./MoveResolver"
import { buildBoard, piece } from "../testUtils"
import type { CHESS_PIECE_TYPE } from "../types/ChessObjects"

describe("getValidMoves", () => {
    it.each<CHESS_PIECE_TYPE>(["PAWN", "ROOK", "KNIGHT", "BISHOP", "QUEEN", "KING"])(
        "dispatches %s to its own move generator instead of returning an empty set",
        (type) => {
            const testPiece = piece("white", type)
            const board = buildBoard([{x: 4, y: 4, piece: testPiece}])

            expect(getValidMoves(board, {x: 4, y: 4}, testPiece).length).toBeGreaterThan(0)
        }
    )
})
