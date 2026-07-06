import { describe, expect, it } from "vitest"
import { getCastlingRookMove, getKingMoves, isCastlingMove, isSquareAttacked } from "./king"
import { buildBoard, expectMoves, piece } from "../../testUtils"

describe("king moves", () => {
    it("moves exactly one square in any direction", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 4, y: 4, piece: king}])

        expectMoves(getKingMoves(board, {x: 4, y: 4}, king), [
            {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3},
            {x: 3, y: 4}, {x: 5, y: 4},
            {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5},
        ])
    })

    it("cannot move onto a square occupied by its own piece", () => {
        const king = piece("white", "KING")
        const friendly = piece("white", "PAWN")
        const board = buildBoard([
            {x: 0, y: 0, piece: king},
            {x: 1, y: 0, piece: friendly},
        ])

        expectMoves(getKingMoves(board, {x: 0, y: 0}, king), [
            {x: 0, y: 1}, {x: 1, y: 1},
        ])
    })
})

describe("castling", () => {
    it("includes both castling squares when neither king, rook, nor the squares between them have moved or are occupied", () => {
        const king = piece("white", "KING")
        const kingsideRook = piece("white", "ROOK")
        const queensideRook = piece("white", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: kingsideRook},
            {x: 0, y: 0, piece: queensideRook},
        ])

        const moves = getKingMoves(board, {x: 4, y: 0}, king)
        expect(moves).toContainEqual({x: 6, y: 0})
        expect(moves).toContainEqual({x: 2, y: 0})
    })

    it("is unavailable once the king has moved", () => {
        const king = piece("white", "KING", true)
        const rook = piece("white", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: rook},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable once the castling rook has moved", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK", true)
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: rook},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable when there's no rook on the corner square", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 4, y: 0, piece: king}])

        const moves = getKingMoves(board, {x: 4, y: 0}, king)
        expect(moves).not.toContainEqual({x: 6, y: 0})
        expect(moves).not.toContainEqual({x: 2, y: 0})
    })

    it("is unavailable when a piece sits between the king and rook", () => {
        const king = piece("white", "KING")
        const kingsideRook = piece("white", "ROOK")
        const queensideRook = piece("white", "ROOK")
        const knight = piece("white", "KNIGHT")
        const bishop = piece("white", "BISHOP")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: kingsideRook},
            {x: 6, y: 0, piece: knight},
            {x: 0, y: 0, piece: queensideRook},
            {x: 1, y: 0, piece: bishop},
        ])

        const moves = getKingMoves(board, {x: 4, y: 0}, king)
        expect(moves).not.toContainEqual({x: 6, y: 0})
        expect(moves).not.toContainEqual({x: 2, y: 0})
    })

    it("is unavailable on both sides while the king is currently in check", () => {
        const king = piece("white", "KING")
        const kingsideRook = piece("white", "ROOK")
        const queensideRook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: kingsideRook},
            {x: 0, y: 0, piece: queensideRook},
            {x: 4, y: 7, piece: attacker},
        ])

        const moves = getKingMoves(board, {x: 4, y: 0}, king)
        expect(moves).not.toContainEqual({x: 6, y: 0})
        expect(moves).not.toContainEqual({x: 2, y: 0})
    })

    it("is unavailable when the king would pass through an attacked square (kingside, f1)", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: rook},
            {x: 5, y: 7, piece: attacker},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable when the king would land on an attacked square (kingside, g1)", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: rook},
            {x: 6, y: 7, piece: attacker},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable when the king would pass through an attacked square (queenside, d1)", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 0, y: 0, piece: rook},
            {x: 3, y: 7, piece: attacker},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 2, y: 0})
    })

    it("is unavailable when the king would land on an attacked square (queenside, c1)", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 0, y: 0, piece: rook},
            {x: 2, y: 7, piece: attacker},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 2, y: 0})
    })

    it("does not require the queenside knight's square (b1) to be unattacked, only empty", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK")
        const attacker = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 0, y: 0, piece: rook},
            {x: 1, y: 7, piece: attacker},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, king)).toContainEqual({x: 2, y: 0})
    })

    it("does not recurse infinitely when both sides are simultaneously eligible to castle", () => {
        const whiteKing = piece("white", "KING")
        const whiteRook = piece("white", "ROOK")
        const blackKing = piece("black", "KING")
        const blackRook = piece("black", "ROOK")
        const board = buildBoard([
            {x: 4, y: 0, piece: whiteKing},
            {x: 7, y: 0, piece: whiteRook},
            {x: 4, y: 7, piece: blackKing},
            {x: 7, y: 7, piece: blackRook},
        ])

        expect(getKingMoves(board, {x: 4, y: 0}, whiteKing)).toContainEqual({x: 6, y: 0})
    })
})

describe("isSquareAttacked", () => {
    it("is true when an enemy piece could move onto the square", () => {
        const rook = piece("black", "ROOK")
        const board = buildBoard([{x: 0, y: 0, piece: rook}])

        expect(isSquareAttacked(board, {x: 0, y: 4}, "black")).toBe(true)
    })

    it("is false when no piece of that color could reach the square", () => {
        const rook = piece("white", "ROOK")
        const board = buildBoard([{x: 0, y: 0, piece: rook}])

        expect(isSquareAttacked(board, {x: 0, y: 4}, "black")).toBe(false)
    })

    it("considers a king's one-step moves", () => {
        const king = piece("black", "KING")
        const board = buildBoard([{x: 4, y: 7, piece: king}])

        expect(isSquareAttacked(board, {x: 3, y: 6}, "black")).toBe(true)
        expect(isSquareAttacked(board, {x: 0, y: 0}, "black")).toBe(false)
    })
})

describe("isCastlingMove", () => {
    it("is true for a king moving two squares", () => {
        const king = piece("white", "KING")
        expect(isCastlingMove(king, {x: 4, y: 0}, {x: 6, y: 0})).toBe(true)
        expect(isCastlingMove(king, {x: 4, y: 0}, {x: 2, y: 0})).toBe(true)
    })

    it("is false for a king's ordinary one-square move", () => {
        const king = piece("white", "KING")
        expect(isCastlingMove(king, {x: 4, y: 0}, {x: 5, y: 0})).toBe(false)
    })

    it("is false for a non-king piece moving two squares", () => {
        const rook = piece("white", "ROOK")
        expect(isCastlingMove(rook, {x: 4, y: 0}, {x: 6, y: 0})).toBe(false)
    })
})

describe("getCastlingRookMove", () => {
    it("maps kingside castling to the h-file rook moving to f-file", () => {
        expect(getCastlingRookMove(6)).toEqual({from: 7, to: 5})
    })

    it("maps queenside castling to the a-file rook moving to d-file", () => {
        expect(getCastlingRookMove(2)).toEqual({from: 0, to: 3})
    })
})
