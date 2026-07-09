import { describe, expect, it } from "vitest"
import { serializePosition } from "./Position"
import { buildBoard, piece } from "../../testUtils"

describe("serializePosition", () => {
    it("is the same for the same arrangement and side to move", () => {
        const board = buildBoard([
            {x: 4, y: 0, piece: piece("white", "KING")},
            {x: 4, y: 7, piece: piece("black", "KING")},
        ])

        expect(serializePosition(board, "white")).toBe(serializePosition(board, "white"))
    })

    it("differs when a piece is on a different square", () => {
        const boardA = buildBoard([{x: 4, y: 0, piece: piece("white", "KING")}])
        const boardB = buildBoard([{x: 5, y: 0, piece: piece("white", "KING")}])

        expect(serializePosition(boardA, "white")).not.toBe(serializePosition(boardB, "white"))
    })

    it("differs when it's a different side's turn on an otherwise identical board", () => {
        const board = buildBoard([{x: 4, y: 0, piece: piece("white", "KING")}])

        expect(serializePosition(board, "white")).not.toBe(serializePosition(board, "black"))
    })

    it("is unaffected by piece id or hasMoved, since those aren't part of the position", () => {
        const boardA = buildBoard([{x: 4, y: 0, piece: {id: "a", color: "white", type: "KING", hasMoved: false}}])
        const boardB = buildBoard([{x: 4, y: 0, piece: {id: "b", color: "white", type: "KING", hasMoved: true}}])

        expect(serializePosition(boardA, "white")).toBe(serializePosition(boardB, "white"))
    })

    it("distinguishes a king from a knight despite both starting with K", () => {
        const boardA = buildBoard([{x: 4, y: 0, piece: piece("white", "KING")}])
        const boardB = buildBoard([{x: 4, y: 0, piece: piece("white", "KNIGHT")}])

        expect(serializePosition(boardA, "white")).not.toBe(serializePosition(boardB, "white"))
    })
})
