import { describe, it } from "vitest"
import { getBishopMoves } from "./bishop"
import { buildBoard, expectMoves, piece } from "../../../testUtils"

describe("bishop moves", () => {
    it("slides diagonally and stops at the board edge", () => {
        const bishop = piece("white", "BISHOP")
        const board = buildBoard([{x: 4, y: 4, piece: bishop}])

        expectMoves(getBishopMoves(board, {x: 4, y: 4}, bishop), [
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

        expectMoves(getBishopMoves(board, {x: 0, y: 0}, bishop), [
            {x: 1, y: 1}, {x: 2, y: 2},
        ])
    })
})
