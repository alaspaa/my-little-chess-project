import { describe, expect, it } from "vitest"
import { getKnightMoves } from "./knight"
import { buildBoard, expectMoves, piece } from "../../testUtils"

describe("knight moves", () => {
    it("moves in an L shape to all 8 squares from an open center", () => {
        const knight = piece("white", "KNIGHT")
        const board = buildBoard([{x: 4, y: 4, piece: knight}])

        expectMoves(getKnightMoves(board, {x: 4, y: 4}, knight), [
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

        expect(getKnightMoves(board, {x: 4, y: 4}, knight)).toContainEqual({x: 5, y: 6})
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

        const moves = getKnightMoves(board, {x: 4, y: 4}, knight)
        expect(moves).toContainEqual({x: 6, y: 5})
        expect(moves).not.toContainEqual({x: 6, y: 3})
    })

    it("stays within the board from a corner", () => {
        const knight = piece("white", "KNIGHT")
        const board = buildBoard([{x: 0, y: 0, piece: knight}])

        expectMoves(getKnightMoves(board, {x: 0, y: 0}, knight), [
            {x: 1, y: 2}, {x: 2, y: 1},
        ])
    })
})
