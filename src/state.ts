import { atom } from "jotai";
import { type BoardCoordinates, type CHESS_PIECE_COLOR, type Player } from "./types/ChessObjects";
import { createEmptyBoard, populateBoardWithPieces } from "./types/GameBoard";

export type Page = "setup" | "game"

export const pieceClickedAtom = atom<string | null>(null)
export const boardCoordinatesAtom = atom<BoardCoordinates | null>(null)
export const pieceClickedIdAtom = atom<string | null>(null)
export const validMovesAtom = atom<BoardCoordinates[]>([])
export const gameBoardAtom = atom(
    populateBoardWithPieces(createEmptyBoard())
)

export const currentPageAtom = atom<Page>("setup")
export const whitePlayerAtom = atom<Player | null>(null)
export const blackPlayerAtom = atom<Player | null>(null)
export const currentTurnAtom = atom<CHESS_PIECE_COLOR>("white")
