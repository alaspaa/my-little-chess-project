import { describe, expect, it } from "vitest"
import { createEmptyBoard, populateBoardWithPieces } from "./GameBoard"
import type { CHESS_PIECE_TYPE } from "./ChessObjects"

describe("createEmptyBoard", () => {
    it("creates an 8x8 board with no pieces", () => {
        const board = createEmptyBoard()

        expect(board).toHaveLength(8)
        board.forEach(row => {
            expect(row).toHaveLength(8)
            row.forEach(square => expect(square.piece).toBeNull())
        })
    })

    it("creates independent row/square objects, not shared references", () => {
        const board = createEmptyBoard()
        board[0][0].piece = {id: "test", color: "white", type: "PAWN", hasMoved: false}

        expect(board[1][0].piece).toBeNull()
        expect(board[0][1].piece).toBeNull()
    })
})

describe("populateBoardWithPieces", () => {
    const board = populateBoardWithPieces(createEmptyBoard())
    const backRank: CHESS_PIECE_TYPE[] = ["ROOK", "KNIGHT", "BISHOP", "QUEEN", "KING", "BISHOP", "KNIGHT", "ROOK"]

    it("places a full row of pawns for each color on their starting rank", () => {
        for(let x = 0; x < 8; x++) {
            expect(board[1][x].piece).toMatchObject({color: "white", type: "PAWN", hasMoved: false})
            expect(board[6][x].piece).toMatchObject({color: "black", type: "PAWN", hasMoved: false})
        }
    })

    it("places the back rank pieces in the standard order for each color", () => {
        for(let x = 0; x < 8; x++) {
            expect(board[0][x].piece).toMatchObject({color: "white", type: backRank[x], hasMoved: false})
            expect(board[7][x].piece).toMatchObject({color: "black", type: backRank[x], hasMoved: false})
        }
    })

    it("leaves the middle of the board empty", () => {
        for(let y = 2; y <= 5; y++) {
            for(let x = 0; x < 8; x++) {
                expect(board[y][x].piece).toBeNull()
            }
        }
    })

    it("gives every piece a unique id", () => {
        const ids = board.flat().map(square => square.piece?.id).filter(Boolean)
        expect(new Set(ids).size).toBe(ids.length)
    })
})
