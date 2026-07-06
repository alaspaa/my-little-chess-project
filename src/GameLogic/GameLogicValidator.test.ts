import { describe, expect, it } from "vitest"
import validateMove, { getLegalMoves, isCheckmate, isKingInCheck } from "./GameLogicValidator"
import getValidMoves from "./MoveGenerator"
import { buildBoard, expectMoves, piece } from "../testUtils"

describe("isKingInCheck", () => {
    it("is false when no enemy piece attacks the king", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 0, y: 0, piece: king}])

        expect(isKingInCheck(board, "white")).toBe(false)
    })

    it("is true when an enemy piece can reach the king's square", () => {
        const king = piece("white", "KING")
        const rook = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 4, piece: king},
            {x: 4, y: 0, piece: rook},
        ])

        expect(isKingInCheck(board, "white")).toBe(true)
    })

    it("is false when a friendly piece blocks the attack line", () => {
        const king = piece("white", "KING")
        const rook = piece("black", "ROOK")
        const blocker = piece("white", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: king},
            {x: 4, y: 0, piece: rook},
            {x: 4, y: 2, piece: blocker},
        ])

        expect(isKingInCheck(board, "white")).toBe(false)
    })
})

describe("getLegalMoves", () => {
    it("excludes moves that would expose the mover's own king to check, but allows moves that keep blocking it", () => {
        // White king on the back rank with a pinned rook directly in front of
        // it, and a black rook further up the same file. Moving the white
        // rook off the file would open it to check; moving along the file
        // (including capturing the attacker) keeps the king safe.
        const king = piece("white", "KING")
        const pinnedRook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 4, y: 1, piece: pinnedRook},
            {x: 4, y: 7, piece: attacker},
        ])

        const moves = getLegalMoves(board, {x: 4, y: 1}, pinnedRook)

        expectMoves(moves, [
            {x: 4, y: 2}, {x: 4, y: 3}, {x: 4, y: 4},
            {x: 4, y: 5}, {x: 4, y: 6}, {x: 4, y: 7},
        ])
    })

    it("only allows moves that resolve an existing check", () => {
        const king = piece("white", "KING")
        const attacker = piece("black", "ROOK")
        const blocker = piece("white", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 4, y: 7, piece: attacker},
            {x: 0, y: 4, piece: blocker},
        ])

        const moves = getLegalMoves(board, {x: 0, y: 4}, blocker)

        // Of the blocker's many raw rook moves, only landing on the checked
        // file resolves the check - everything else leaves the king exposed.
        expectMoves(moves, [{x: 4, y: 4}])
    })

    it("does not restrict moves when the mover's king isn't threatened", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const board = buildBoard([
            {x: 0, y: 0, piece: king},
            {x: 4, y: 4, piece: rook},
        ])

        const moves = getLegalMoves(board, {x: 4, y: 4}, rook)
        // With no check on the board, the legal move set should be identical
        // to the raw pseudo-legal move set - nothing should get filtered out.
        expectMoves(moves, getValidMoves(board, {x: 4, y: 4}, rook))
    })
})

describe("validateMove", () => {
    it("accepts a legal move", () => {
        const rook = piece("white", "ROOK")
        const board = buildBoard([{x: 0, y: 0, piece: rook}])

        expect(validateMove(board, {x: 0, y: 0}, {x: 0, y: 5}, rook)).toBe(true)
    })

    it("rejects a move that isn't in the piece's move set", () => {
        const rook = piece("white", "ROOK")
        const board = buildBoard([{x: 0, y: 0, piece: rook}])

        expect(validateMove(board, {x: 0, y: 0}, {x: 1, y: 1}, rook)).toBe(false)
    })

    // Check-safety filtering itself (pins, blocking, etc.) is covered in
    // depth by the getLegalMoves tests above - validateMove is a thin
    // `getLegalMoves(...).some(...)` wrapper, so it only needs its own
    // matching logic (accept/reject cases above) exercised here.
})

describe("isCheckmate", () => {
    it("is false when the king is not in check", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 0, y: 0, piece: king}])

        expect(isCheckmate(board, "white")).toBe(false)
    })

    it("is false when a check can be escaped, blocked, or the attacker captured", () => {
        const king = piece("white", "KING")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 4, y: 7, piece: attacker},
        ])

        // King has empty squares to step sideways to, out of the rook's file.
        expect(isCheckmate(board, "white")).toBe(false)
    })

    it("is true when the king is in check with no legal response", () => {
        // Classic back-rank mate: white king boxed in by its own pawns, black
        // rook delivers check along the back rank with nothing able to
        // block, capture, or give the king an escape square.
        const king = piece("white", "KING")
        const pawnA = piece("white", "PAWN", true)
        const pawnB = piece("white", "PAWN", true)
        const pawnC = piece("white", "PAWN", true)
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 6, y: 0, piece: king},
            {x: 5, y: 1, piece: pawnA},
            {x: 6, y: 1, piece: pawnB},
            {x: 7, y: 1, piece: pawnC},
            {x: 0, y: 0, piece: attacker},
        ])

        expect(isCheckmate(board, "white")).toBe(true)
    })
})
