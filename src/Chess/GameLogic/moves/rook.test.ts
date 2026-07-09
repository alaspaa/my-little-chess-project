import { describe, it } from "vitest"
import { getRookMoves } from "./rook"
import { buildBoard, expectMoves, piece } from "../../../testUtils"

describe("rook moves", () => {
    it("slides in straight lines until the edge of the board", () => {
        const rook = piece("white", "ROOK")
        const board = buildBoard([{x: 4, y: 4, piece: rook}])

        expectMoves(getRookMoves(board, {x: 4, y: 4}, rook), [
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

        expectMoves(getRookMoves(board, {x: 4, y: 4}, rook), [
            {x: 4, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3}, {x: 4, y: 5},
            {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4},
            {x: 5, y: 4}, {x: 6, y: 4},
        ])
    })
})
