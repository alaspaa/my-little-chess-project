import { describe, expect, it } from "vitest"
import getValidMoves, { getCastlingRookMove, isCastlingMove, isPawnPromotion, isSquareAttacked } from "./MoveValidator"
import { buildBoard, expectMoves, piece } from "../testUtils"

describe("pawn moves", () => {
    it("can move one or two squares forward from its starting rank", () => {
        const whitePawn = piece("white", "PAWN")
        const board = buildBoard([{x: 4, y: 1, piece: whitePawn}])

        expectMoves(getValidMoves(board, {x: 4, y: 1}, whitePawn), [
            {x: 4, y: 2},
            {x: 4, y: 3},
        ])
    })

    it("can only move one square forward once it has moved", () => {
        const whitePawn = piece("white", "PAWN", true)
        const board = buildBoard([{x: 4, y: 2, piece: whitePawn}])

        expectMoves(getValidMoves(board, {x: 4, y: 2}, whitePawn), [{x: 4, y: 3}])
    })

    it("is blocked by a piece directly ahead, including the two-square advance", () => {
        const whitePawn = piece("white", "PAWN")
        const blocker = piece("black", "PAWN")
        const board = buildBoard([
            {x: 4, y: 1, piece: whitePawn},
            {x: 4, y: 2, piece: blocker},
        ])

        expectMoves(getValidMoves(board, {x: 4, y: 1}, whitePawn), [])
    })

    it("can capture diagonally but not move diagonally into an empty square", () => {
        const whitePawn = piece("white", "PAWN", true)
        const enemyLeft = piece("black", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: whitePawn},
            {x: 3, y: 5, piece: enemyLeft},
        ])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, whitePawn), [
            {x: 4, y: 5},
            {x: 3, y: 5},
        ])
    })

    it("cannot capture a piece of its own color", () => {
        const whitePawn = piece("white", "PAWN", true)
        const friendly = piece("white", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: whitePawn},
            {x: 3, y: 5, piece: friendly},
        ])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, whitePawn), [{x: 4, y: 5}])
    })

    it("moves in the opposite direction for black", () => {
        const blackPawn = piece("black", "PAWN")
        const board = buildBoard([{x: 4, y: 6, piece: blackPawn}])

        expectMoves(getValidMoves(board, {x: 4, y: 6}, blackPawn), [
            {x: 4, y: 5},
            {x: 4, y: 4},
        ])
    })
})

describe("rook moves", () => {
    it("slides in straight lines until the edge of the board", () => {
        const rook = piece("white", "ROOK")
        const board = buildBoard([{x: 4, y: 4, piece: rook}])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, rook), [
            {x: 4, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3},
            {x: 4, y: 5}, {x: 4, y: 6}, {x: 4, y: 7},
            {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4},
            {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4},
        ])
    })

    it("stops before a friendly piece and can capture an enemy piece", () => {
        const rook = piece("white", "ROOK")
        const friendly = piece("white", "PAWN")
        const enemy = piece("black", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: rook},
            {x: 4, y: 6, piece: friendly},
            {x: 6, y: 4, piece: enemy},
        ])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, rook), [
            {x: 4, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3}, {x: 4, y: 5},
            {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4},
            {x: 5, y: 4}, {x: 6, y: 4},
        ])
    })
})

describe("bishop moves", () => {
    it("slides diagonally and stops at the board edge", () => {
        const bishop = piece("white", "BISHOP")
        const board = buildBoard([{x: 4, y: 4, piece: bishop}])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, bishop), [
            {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7},
            {x: 5, y: 3}, {x: 6, y: 2}, {x: 7, y: 1},
            {x: 3, y: 5}, {x: 2, y: 6}, {x: 1, y: 7},
            {x: 3, y: 3}, {x: 2, y: 2}, {x: 1, y: 1}, {x: 0, y: 0},
        ])
    })

    it("cannot jump over a piece blocking its diagonal", () => {
        const bishop = piece("white", "BISHOP")
        const blocker = piece("black", "PAWN")
        const board = buildBoard([
            {x: 0, y: 0, piece: bishop},
            {x: 2, y: 2, piece: blocker},
        ])

        expectMoves(getValidMoves(board, {x: 0, y: 0}, bishop), [
            {x: 1, y: 1}, {x: 2, y: 2},
        ])
    })
})

describe("knight moves", () => {
    it("moves in an L shape to all 8 squares from an open center", () => {
        const knight = piece("white", "KNIGHT")
        const board = buildBoard([{x: 4, y: 4, piece: knight}])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, knight), [
            {x: 5, y: 6}, {x: 6, y: 5}, {x: 6, y: 3}, {x: 5, y: 2},
            {x: 3, y: 2}, {x: 2, y: 3}, {x: 2, y: 5}, {x: 3, y: 6},
        ])
    })

    it("jumps over pieces directly in its path, unaffected by what's in between", () => {
        const knight = piece("white", "KNIGHT")
        // Sits on the straight-line path between the knight and the (5, 6)
        // landing square, which a sliding piece couldn't move past.
        const inTheWay = piece("white", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: knight},
            {x: 4, y: 5, piece: inTheWay},
        ])

        expect(getValidMoves(board, {x: 4, y: 4}, knight)).toContainEqual({x: 5, y: 6})
    })

    it("can capture an enemy piece on a landing square but not a friendly one", () => {
        const knight = piece("white", "KNIGHT")
        const enemy = piece("black", "PAWN")
        const friendly = piece("white", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: knight},
            {x: 6, y: 5, piece: enemy},
            {x: 6, y: 3, piece: friendly},
        ])

        const moves = getValidMoves(board, {x: 4, y: 4}, knight)
        expect(moves).toContainEqual({x: 6, y: 5})
        expect(moves).not.toContainEqual({x: 6, y: 3})
    })

    it("stays within the board from a corner", () => {
        const knight = piece("white", "KNIGHT")
        const board = buildBoard([{x: 0, y: 0, piece: knight}])

        expectMoves(getValidMoves(board, {x: 0, y: 0}, knight), [
            {x: 1, y: 2}, {x: 2, y: 1},
        ])
    })
})

describe("queen moves", () => {
    it("combines rook and bishop movement", () => {
        const queen = piece("white", "QUEEN")
        const board = buildBoard([{x: 0, y: 0, piece: queen}])

        const moves = getValidMoves(board, {x: 0, y: 0}, queen)
        expect(moves).toContainEqual({x: 7, y: 0})
        expect(moves).toContainEqual({x: 0, y: 7})
        expect(moves).toContainEqual({x: 7, y: 7})
    })

    it("cannot jump over a blocking piece in either its straight or diagonal lines", () => {
        const queen = piece("white", "QUEEN")
        const straightBlocker = piece("black", "PAWN")
        const diagonalBlocker = piece("black", "PAWN")
        const board = buildBoard([
            {x: 0, y: 0, piece: queen},
            {x: 3, y: 0, piece: straightBlocker},
            {x: 3, y: 3, piece: diagonalBlocker},
        ])

        const moves = getValidMoves(board, {x: 0, y: 0}, queen)
        expect(moves).not.toContainEqual({x: 7, y: 0})
        expect(moves).not.toContainEqual({x: 7, y: 7})
        expect(moves).toContainEqual({x: 3, y: 0})
        expect(moves).toContainEqual({x: 3, y: 3})
    })
})

describe("king moves", () => {
    it("moves exactly one square in any direction", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 4, y: 4, piece: king}])

        expectMoves(getValidMoves(board, {x: 4, y: 4}, king), [
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

        expectMoves(getValidMoves(board, {x: 0, y: 0}, king), [
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

        const moves = getValidMoves(board, {x: 4, y: 0}, king)
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable once the castling rook has moved", () => {
        const king = piece("white", "KING")
        const rook = piece("white", "ROOK", true)
        const board = buildBoard([
            {x: 4, y: 0, piece: king},
            {x: 7, y: 0, piece: rook},
        ])

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
    })

    it("is unavailable when there's no rook on the corner square", () => {
        const king = piece("white", "KING")
        const board = buildBoard([{x: 4, y: 0, piece: king}])

        const moves = getValidMoves(board, {x: 4, y: 0}, king)
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

        const moves = getValidMoves(board, {x: 4, y: 0}, king)
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

        const moves = getValidMoves(board, {x: 4, y: 0}, king)
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 6, y: 0})
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 2, y: 0})
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).not.toContainEqual({x: 2, y: 0})
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

        expect(getValidMoves(board, {x: 4, y: 0}, king)).toContainEqual({x: 2, y: 0})
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

        expect(getValidMoves(board, {x: 4, y: 0}, whiteKing)).toContainEqual({x: 6, y: 0})
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

describe("isPawnPromotion", () => {
    it("is true for a white pawn reaching the last rank", () => {
        const whitePawn = piece("white", "PAWN")
        expect(isPawnPromotion(whitePawn, {x: 4, y: 7})).toBe(true)
    })

    it("is true for a black pawn reaching the last rank", () => {
        const blackPawn = piece("black", "PAWN")
        expect(isPawnPromotion(blackPawn, {x: 4, y: 0})).toBe(true)
    })

    it("is false for a white pawn that hasn't reached the last rank", () => {
        const whitePawn = piece("white", "PAWN")
        expect(isPawnPromotion(whitePawn, {x: 4, y: 6})).toBe(false)
    })

    it("is false for a white pawn reaching its own back rank instead of the opponent's", () => {
        const whitePawn = piece("white", "PAWN")
        expect(isPawnPromotion(whitePawn, {x: 4, y: 0})).toBe(false)
    })

    it("is false for a non-pawn piece reaching the last rank", () => {
        const whiteQueen = piece("white", "QUEEN")
        expect(isPawnPromotion(whiteQueen, {x: 4, y: 7})).toBe(false)
    })
})
