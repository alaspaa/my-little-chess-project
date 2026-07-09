import { describe, expect, it } from "vitest"
import { getPawnMoves, isPawnPromotion } from "./pawn"
import { buildBoard, expectMoves, piece } from "../../../testUtils"

describe("pawn moves", () => {
    it("can move one or two squares forward from its starting rank", () => {
        const whitePawn = piece("white", "PAWN")
        const board = buildBoard([{x: 4, y: 1, piece: whitePawn}])

        expectMoves(getPawnMoves(board, {x: 4, y: 1}, whitePawn), [
            {x: 4, y: 2},
            {x: 4, y: 3},
        ])
    })

    it("can only move one square forward once it has moved", () => {
        const whitePawn = piece("white", "PAWN", true)
        const board = buildBoard([{x: 4, y: 2, piece: whitePawn}])

        expectMoves(getPawnMoves(board, {x: 4, y: 2}, whitePawn), [{x: 4, y: 3}])
    })

    it("is blocked by a piece directly ahead, including the two-square advance", () => {
        const whitePawn = piece("white", "PAWN")
        const blocker = piece("black", "PAWN")
        const board = buildBoard([
            {x: 4, y: 1, piece: whitePawn},
            {x: 4, y: 2, piece: blocker},
        ])

        expectMoves(getPawnMoves(board, {x: 4, y: 1}, whitePawn), [])
    })

    it("can capture diagonally but not move diagonally into an empty square", () => {
        const whitePawn = piece("white", "PAWN", true)
        const enemyLeft = piece("black", "PAWN")
        const board = buildBoard([
            {x: 4, y: 4, piece: whitePawn},
            {x: 3, y: 5, piece: enemyLeft},
        ])

        expectMoves(getPawnMoves(board, {x: 4, y: 4}, whitePawn), [
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

        expectMoves(getPawnMoves(board, {x: 4, y: 4}, whitePawn), [{x: 4, y: 5}])
    })

    it("moves in the opposite direction for black", () => {
        const blackPawn = piece("black", "PAWN")
        const board = buildBoard([{x: 4, y: 6, piece: blackPawn}])

        expectMoves(getPawnMoves(board, {x: 4, y: 6}, blackPawn), [
            {x: 4, y: 5},
            {x: 4, y: 4},
        ])
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
