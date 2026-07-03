import { expect } from "vitest"
import { createEmptyBoard } from "./types/GameBoard"
import type { BoardCoordinates, CHESS_PIECE_COLOR, CHESS_PIECE_TYPE, ChessPiece, Square } from "./types/ChessObjects"

let nextPieceId = 0

function piece(color: CHESS_PIECE_COLOR, type: CHESS_PIECE_TYPE, hasMoved = false): ChessPiece {
    nextPieceId += 1
    return {
        id: `${color}${type.toLowerCase()}${nextPieceId}`,
        color,
        type,
        hasMoved,
    }
}

type Placement = {
    x: number,
    y: number,
    piece: ChessPiece,
}

function buildBoard(placements: Placement[]): Square[][] {
    const board = createEmptyBoard()
    for(const placement of placements) {
        board[placement.y][placement.x] = {piece: placement.piece}
    }
    return board
}

function sorted(moves: BoardCoordinates[]): BoardCoordinates[] {
    return [...moves].sort((a, b) => (a.y * 8 + a.x) - (b.y * 8 + b.x))
}

function expectMoves(moves: BoardCoordinates[], expected: BoardCoordinates[]) {
    expect(sorted(moves)).toEqual(sorted(expected))
}

export { piece, buildBoard, expectMoves }
