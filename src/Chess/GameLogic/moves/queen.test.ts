import { describe, expect, it } from "vitest"
import { getQueenMoves } from "./queen"
import { buildBoard, piece } from "../../../testUtils"

describe("queen moves", () => {
    it("combines rook and bishop movement", () => {
        const queen = piece("white", "QUEEN")
        const board = buildBoard([{x: 0, y: 0, piece: queen}])

        const moves = getQueenMoves(board, {x: 0, y: 0}, queen)
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

        const moves = getQueenMoves(board, {x: 0, y: 0}, queen)
        expect(moves).not.toContainEqual({x: 7, y: 0})
        expect(moves).not.toContainEqual({x: 7, y: 7})
        expect(moves).toContainEqual({x: 3, y: 0})
        expect(moves).toContainEqual({x: 3, y: 3})
    })
})
